import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { ResponseSchema } from "@google/generative-ai";
import { Router } from "express";
import { z } from "zod";
import { config } from "../config";
import { randomQuerySchema } from "../lib/filmFilters";
import { HttpError } from "../middleware/errorHandler";
import { getValidated, validate } from "../middleware/validate";
import { getQualityCandidates, type RandomFilmRow } from "./random";

export const naturalRollRouter = Router();

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const GEMINI_MODEL = "gemini-2.5-flash-lite";
const CANDIDATE_TOP_N = 100;
const CANDIDATE_SAMPLE_N = 50;

// ── Rate limiting ──────────────────────────────────────────────────────────────

type RateLimitBucket = { count: number; resetAt: number };
const rateLimitBuckets = new Map<string, RateLimitBucket>();

const naturalRollBodySchema = z.object({
  prompt: z.string().trim().min(1).max(500),
  userId: z.string().trim().min(1).max(180).optional(),
  count: z.number().int().min(1).max(6).optional(),
}).strict();

type NaturalRollBody = z.infer<typeof naturalRollBodySchema>;

function getRateLimitKey(body: NaturalRollBody, reqIp: string | undefined): string {
  return body.userId ? `user:${body.userId}` : `ip:${reqIp ?? "unknown"}`;
}

function assertWithinRateLimit(key: string) {
  const now = Date.now();
  const existing = rateLimitBuckets.get(key);
  if (!existing || existing.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return;
  }
  if (existing.count >= RATE_LIMIT_MAX) {
    throw new HttpError(429, "Natural roll limit reached. Try again later.", "RATE_LIMITED");
  }
  existing.count += 1;
}

// ── Stage 1: structural filter extraction ─────────────────────────────────────
// Only hard, explicit constraints — no mood/tone/quality inference.

const nullableString = z.union([z.string().trim().min(1), z.null()]);
const nullableBoolean = z.union([z.boolean(), z.null()]);
const nullableNumber = z.union([z.number(), z.null()]);

const stage1Schema = z.object({
  language: nullableString.optional(),
  genre: nullableString.optional(),
  contentType: nullableString.optional(),
  awardBody: z.union([z.enum(["oscar", "goldenglobe", "cannes", "all"]), z.null()]).optional(),
  winnerOnly: nullableBoolean.optional(),
  nominatedOnly: nullableBoolean.optional(),
  decadeMin: nullableNumber.optional(),
  decadeMax: nullableNumber.optional(),
  director: nullableString.optional(),
  person: nullableString.optional(),
  awardYear: nullableNumber.optional(),
  category: nullableString.optional(),
  femaleDirectorOnly: nullableBoolean.optional(),
}).strict();

type Stage1Filters = z.infer<typeof stage1Schema>;

const stage1ResponseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    language: { type: SchemaType.STRING, nullable: true },
    genre: { type: SchemaType.STRING, nullable: true },
    contentType: { type: SchemaType.STRING, nullable: true },
    awardBody: { type: SchemaType.STRING, format: "enum", enum: ["oscar", "goldenglobe", "cannes", "all"], nullable: true },
    winnerOnly: { type: SchemaType.BOOLEAN, nullable: true },
    nominatedOnly: { type: SchemaType.BOOLEAN, nullable: true },
    decadeMin: { type: SchemaType.INTEGER, nullable: true },
    decadeMax: { type: SchemaType.INTEGER, nullable: true },
    director: { type: SchemaType.STRING, nullable: true },
    person: { type: SchemaType.STRING, nullable: true },
    awardYear: { type: SchemaType.INTEGER, nullable: true },
    category: { type: SchemaType.STRING, nullable: true },
    femaleDirectorOnly: { type: SchemaType.BOOLEAN, nullable: true },
  },
};

const stage1Instruction = `
Extract ONLY explicit structural constraints from the user's film request. Return JSON.

Fields: language, genre, contentType, awardBody, winnerOnly, nominatedOnly, decadeMin, decadeMax, director, person, awardYear, category, femaleDirectorOnly.

Rules:
- language: ISO 639-1 code when user specifies a language or country. French/France→fr, Italian/Italy→it, German/Germany→de, Japanese/Japan→ja, Spanish→es, Korean→ko, Chinese/China→zh, Russian→ru, Portuguese/Brazil→pt, Swedish→sv. Only from explicit country/language words — never from mood.
- genre: Only when user explicitly names a film genre or type. Use: Drama, Comedy, Horror, Thriller, Romance, Action, Science Fiction, Documentary, Animation, Crime, History, War, Western, Music, Biography, Mystery, Fantasy, Adventure. Historical/period piece → History. Sci-fi/space → Science Fiction. DO NOT set genre for mood or emotion words (sad, crying, beautiful, scary, dark, intense — these are NOT genre names).
- contentType: "movie" only if user says film/movie explicitly. "series" only if user says series/show/TV explicitly.
- awardBody: oscar, goldenglobe, cannes, or all. Only when user mentions an award.
- winnerOnly/nominatedOnly: only when explicitly asked.
- decadeMin/decadeMax: only for explicit decade or era. 1990s → 1990/1999.
- director/person: only when user names a specific person.
- awardYear/category: only when explicitly mentioned.
- femaleDirectorOnly: only when user asks for female or woman director.
- Omit everything else. NEVER infer mood, quality, rating, or runtime. If in doubt, leave it out.
`.trim();

// ── Stage 2: semantic reranking ────────────────────────────────────────────────
// Gemini reads actual film data and picks the best matches for the full prompt.

const rerankResponseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    picks: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
};

const rerankOutputSchema = z.object({ picks: z.array(z.string()) });

const rerankInstruction = `
You are a film recommendation expert. Given a user's description and a list of candidate films, pick the best matches.
Return JSON: { "picks": ["id1", "id2", ...] }
Use the exact IDs from the list. Order best match first. Only return IDs from the provided list.
`.trim();

// ── Helpers ────────────────────────────────────────────────────────────────────

function parseGeminiJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return JSON.parse(fenced?.[1] ?? trimmed);
}

function cleanStage1Filters(filters: Stage1Filters): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== null && v !== undefined && v !== ""),
  );
}

async function extractStructuralFilters(prompt: string): Promise<Stage1Filters> {
  if (!config.geminiApiKey) {
    throw new HttpError(503, "Gemini API key is not configured", "GEMINI_NOT_CONFIGURED");
  }
  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: stage1Instruction,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: stage1ResponseSchema,
      temperature: 0.1,
      maxOutputTokens: 256,
    },
  });
  const result = await model.generateContent(prompt);
  try {
    return stage1Schema.parse(parseGeminiJson(result.response.text()));
  } catch {
    return {};
  }
}

function formatCandidatesForRerank(candidates: RandomFilmRow[]): string {
  return candidates.map(f => {
    const genres = Array.isArray(f.genres) ? (f.genres as string[]).join(", ") : "";
    const plot = f.plot ? f.plot.slice(0, 160) : "";
    const director = f.director ? ` | Dir. ${f.director}` : "";
    return `${f.id} | ${f.title} (${f.year}) | ${genres}${director}${plot ? ` | ${plot}` : ""}`;
  }).join("\n");
}

async function rerankCandidates(
  prompt: string,
  candidates: RandomFilmRow[],
  count: number,
): Promise<string[]> {
  if (!config.geminiApiKey) return candidates.slice(0, count).map(f => f.id);

  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: rerankInstruction,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: rerankResponseSchema,
      temperature: 0.2,
      maxOutputTokens: 128,
    },
  });

  const rerankPrompt = `User wants: "${prompt}"\n\nPick the ${count} best from these ${candidates.length} films:\n\n${formatCandidatesForRerank(candidates)}`;

  try {
    const result = await model.generateContent(rerankPrompt);
    const parsed = rerankOutputSchema.parse(parseGeminiJson(result.response.text()));
    const validIds = new Set(candidates.map(f => f.id));
    return parsed.picks.filter(id => validIds.has(id)).slice(0, count);
  } catch {
    return candidates.slice(0, count).map(f => f.id);
  }
}

// ── Route ──────────────────────────────────────────────────────────────────────

naturalRollRouter.post("/", validate(naturalRollBodySchema, "body"), async (req, res) => {
  const body = getValidated<NaturalRollBody>(req, "body");
  assertWithinRateLimit(getRateLimitKey(body, req.ip));

  const count = body.count ?? 4;

  // Stage 1: extract structural constraints
  const structuralFilters = await extractStructuralFilters(body.prompt);
  const cleaned = cleanStage1Filters(structuralFilters);
  const query = randomQuerySchema.parse({ ...cleaned, userId: body.userId, limit: 1, page: 1 });

  // Stage 2: candidate pool — top 100 by IMDb rating, randomly sampled to 50
  let { films: candidates, total } = await getQualityCandidates(query, CANDIDATE_TOP_N, CANDIDATE_SAMPLE_N);

  // If no candidates, relax by dropping genre
  let relaxed = false;
  if (candidates.length === 0 && structuralFilters.genre) {
    const relaxedCleaned = cleanStage1Filters({ ...structuralFilters, genre: null });
    const relaxedQuery = randomQuerySchema.parse({ ...relaxedCleaned, userId: body.userId, limit: 1, page: 1 });
    const relaxedResult = await getQualityCandidates(relaxedQuery, CANDIDATE_TOP_N, CANDIDATE_SAMPLE_N);
    candidates = relaxedResult.films;
    total = relaxedResult.total;
    relaxed = true;
  }

  if (candidates.length === 0) {
    res.status(404).json({
      error: "No films match the interpreted filters",
      code: "NO_FILMS_FOUND",
      interpretedFilters: cleaned,
    });
    return;
  }

  // Stage 3: semantic reranking (skip if pool is already small enough)
  let finalFilms: RandomFilmRow[];
  if (candidates.length <= count) {
    finalFilms = candidates;
  } else {
    const pickedIds = await rerankCandidates(body.prompt, candidates, count);
    const idToFilm = new Map(candidates.map(f => [f.id, f]));
    finalFilms = pickedIds.map(id => idToFilm.get(id)).filter((f): f is RandomFilmRow => f !== undefined);

    // Pad with remaining candidates if reranker returned fewer than expected
    if (finalFilms.length < Math.min(count, candidates.length)) {
      const picked = new Set(pickedIds);
      const rest = candidates.filter(f => !picked.has(f.id));
      finalFilms = [...finalFilms, ...rest].slice(0, count);
    }
  }

  res.json({
    films: finalFilms,
    total,
    interpretedFilters: cleaned,
    relaxed,
  });
});
