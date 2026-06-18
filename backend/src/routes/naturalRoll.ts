import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { ResponseSchema } from "@google/generative-ai";
import { Router } from "express";
import { z } from "zod";
import { config } from "../config";
import { randomQuerySchema } from "../lib/filmFilters";
import { getAllowedFilterValues } from "../lib/allowedFilterValues";
import { validateStructuralFilters } from "../lib/validateFilters";
import { HttpError } from "../middleware/errorHandler";
import { getValidated, validate } from "../middleware/validate";
import { getQualityCandidates, type RandomFilmRow } from "./random";

export const naturalRollRouter = Router();

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const GEMINI_MODEL = "gemini-2.5-flash-lite";
const CANDIDATE_TOP_N = 100;
const CANDIDATE_SAMPLE_N = 50;

// Order in which soft constraints are loosened when a query returns zero films
// (cumulative — least essential to most). Hard intent like director/person and
// award winner/nominee flags are never auto-relaxed.
const RELAX_PRIORITY = ["genre", "category", "language", "awardYear", "decadeMin", "decadeMax"] as const;

const LOCAL_GENRE_PATTERNS: Array<[RegExp, string]> = [
  [/\b(sci[-\s]?fi|science fiction|space)\b/i, "Science Fiction"],
  [/\b(horror|scary|frightening)\b/i, "Horror"],
  [/\b(thriller|suspense)\b/i, "Thriller"],
  [/\b(comedy|funny|comedie|comedic)\b/i, "Comedy"],
  [/\b(romance|romantic|love story)\b/i, "Romance"],
  [/\b(action)\b/i, "Action"],
  [/\b(documentary|doc)\b/i, "Documentary"],
  [/\b(animation|animated|anime)\b/i, "Animation"],
  [/\b(crime|gangster|noir)\b/i, "Crime"],
  [/\b(history|historical|period piece)\b/i, "History"],
  [/\b(war)\b/i, "War"],
  [/\b(western)\b/i, "Western"],
  [/\b(music|musical)\b/i, "Music"],
  [/\b(biography|biopic)\b/i, "Biography"],
  [/\b(mystery)\b/i, "Mystery"],
  [/\b(fantasy)\b/i, "Fantasy"],
  [/\b(adventure)\b/i, "Adventure"],
  [/\b(drama|dramatic)\b/i, "Drama"],
];

const LOCAL_LANGUAGE_PATTERNS: Array<[RegExp, string]> = [
  [/\b(french|france|francaise?|français|francais)\b/i, "fr"],
  [/\b(italian|italy)\b/i, "it"],
  [/\b(german|germany|deutsch)\b/i, "de"],
  [/\b(japanese|japan)\b/i, "ja"],
  [/\b(spanish|spain|mexican|mexico)\b/i, "es"],
  [/\b(korean|korea)\b/i, "ko"],
  [/\b(chinese|china|mandarin|cantonese)\b/i, "zh"],
  [/\b(russian|russia)\b/i, "ru"],
  [/\b(portuguese|portugal|brazilian|brazil)\b/i, "pt"],
  [/\b(swedish|sweden)\b/i, "sv"],
];

const LOCAL_CATEGORY_PATTERNS: Array<[RegExp, string]> = [
  [/\bbest picture\b/i, "Best Picture"],
  [/\bbest director\b/i, "Directing"],
  [/\bbest actress\b/i, "Actress"],
  [/\bbest actor\b/i, "Actor"],
  [/\bbest screenplay\b/i, "Writing"],
  [/\bcinematograph(y|er)\b/i, "Cinematography"],
  [/\bforeign language\b|\binternational feature\b/i, "International Feature"],
];

const LOCAL_SEMANTIC_KEYWORDS: Record<string, string[]> = {
  sad: ["grief", "loss", "mourning", "melancholy", "tragic", "lonely", "heartbreak"],
  beautiful: ["beautiful", "poetic", "lyrical", "tender", "moving", "romantic"],
  uplifting: ["uplifting", "hope", "joy", "inspiring", "feel-good", "triumph"],
  dark: ["dark", "bleak", "grim", "violent", "disturbing", "sinister"],
  psychological: ["psychological", "paranoia", "obsession", "mind", "mental", "fear"],
  fear: ["fear", "terror", "dread", "haunting", "nightmare", "threat"],
  gore: ["gore", "bloody", "blood", "slasher"],
  underrated: ["hidden", "obscure", "overlooked", "cult", "independent"],
};

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

function firstMatch<T>(prompt: string, patterns: Array<[RegExp, T]>): T | undefined {
  return patterns.find(([pattern]) => pattern.test(prompt))?.[1];
}

function extractDecadeFilters(prompt: string): Pick<Stage1Filters, "decadeMin" | "decadeMax"> {
  const lastYears = prompt.match(/\blast\s+(\d{1,2})\s+years?\b/i);
  if (lastYears) {
    const years = Number(lastYears[1]);
    const currentYear = new Date().getFullYear();
    return { decadeMin: currentYear - years, decadeMax: currentYear };
  }

  const decade = prompt.match(/\b(18|19|20)(\d)0s\b/i);
  if (decade) {
    const start = Number(`${decade[1]}${decade[2]}0`);
    return { decadeMin: start, decadeMax: start + 9 };
  }

  const shorthandDecade = prompt.match(/\b(?:the\s+)?['’]?(\d{2})s\b/i);
  if (shorthandDecade) {
    const value = Number(shorthandDecade[1]);
    const start = value >= 30 ? 1900 + value : 2000 + value;
    return { decadeMin: start, decadeMax: start + 9 };
  }

  const afterYear = prompt.match(/\b(?:after|since|from)\s+(18|19|20)\d{2}\b/i);
  if (afterYear) return { decadeMin: Number(afterYear[0].match(/\d{4}/)?.[0]) };

  const beforeYear = prompt.match(/\b(?:before|pre)\s+(18|19|20)\d{2}\b/i);
  if (beforeYear) return { decadeMax: Number(beforeYear[0].match(/\d{4}/)?.[0]) };

  return {};
}

function extractLocalStructuralFilters(prompt: string): Stage1Filters {
  const filters: Stage1Filters = {};
  const lowerPrompt = prompt.toLowerCase();

  filters.language = firstMatch(prompt, LOCAL_LANGUAGE_PATTERNS);
  filters.genre = firstMatch(prompt, LOCAL_GENRE_PATTERNS);
  filters.category = firstMatch(prompt, LOCAL_CATEGORY_PATTERNS);

  if (/\b(series|show|tv)\b/i.test(prompt)) filters.contentType = "series";
  if (/\b(film|movie|movies|feature)\b/i.test(prompt)) filters.contentType = "movie";

  if (/\b(oscar|academy award)\b/i.test(prompt)) filters.awardBody = "oscar";
  if (/\b(golden globe|globes)\b/i.test(prompt)) filters.awardBody = "goldenglobe";
  if (/\bcannes\b/i.test(prompt)) filters.awardBody = "cannes";

  if (/\b(winner|won|winning)\b/i.test(prompt)) filters.winnerOnly = true;
  if (/\b(nominee|nominated|nomination)\b/i.test(prompt)) filters.nominatedOnly = true;
  if (/\b(female|woman|women)\s+director\b/i.test(prompt)) filters.femaleDirectorOnly = true;

  Object.assign(filters, extractDecadeFilters(prompt));

  const awardYear = lowerPrompt.match(/\b(18|19|20)\d{2}\s+(oscars?|academy awards?|golden globes?|cannes)\b/i);
  if (awardYear) filters.awardYear = Number(awardYear[0].match(/\d{4}/)?.[0]);

  return stage1Schema.parse(filters);
}

async function extractStructuralFilters(prompt: string): Promise<Stage1Filters> {
  if (!config.geminiApiKey) {
    return extractLocalStructuralFilters(prompt);
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
  try {
    const result = await model.generateContent(prompt);
    return stage1Schema.parse(parseGeminiJson(result.response.text()));
  } catch (error) {
    console.warn("Gemini structural extraction failed; using local fallback.", error);
    return extractLocalStructuralFilters(prompt);
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

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .match(/[a-z0-9]+/g) ?? [];
}

function localRerankCandidates(
  prompt: string,
  candidates: RandomFilmRow[],
  count: number,
): string[] {
  const promptTokens = new Set(tokenize(prompt).filter(token => token.length > 2));
  const expandedTerms = new Set(promptTokens);

  for (const [term, keywords] of Object.entries(LOCAL_SEMANTIC_KEYWORDS)) {
    if (promptTokens.has(term)) keywords.forEach(keyword => expandedTerms.add(keyword));
  }

  const wantsUnderrated = /\b(underrated|hidden gem|obscure|overlooked)\b/i.test(prompt);
  const rejectsGore = /\b(rather than gore|not gore|no gore|less gore)\b/i.test(prompt);

  return candidates
    .map(film => {
      const haystack = tokenize([
        film.title,
        film.originalTitle,
        film.year,
        film.genres.join(" "),
        film.director,
        film.plot,
      ].filter(Boolean).join(" "));

      let score = 0;
      for (const token of haystack) {
        if (promptTokens.has(token)) score += 3;
        if (expandedTerms.has(token)) score += 1;
      }

      if (film.imdbRating != null) score += film.imdbRating / 2;
      if (wantsUnderrated && !film.imdbTopMovieRank && !film.imdbTopTvRank) score += 2;
      if (rejectsGore && haystack.some(token => ["gore", "bloody", "blood", "slasher"].includes(token))) {
        score -= 5;
      }

      return { id: film.id, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(result => result.id);
}

async function rerankCandidates(
  prompt: string,
  candidates: RandomFilmRow[],
  count: number,
): Promise<string[]> {
  if (!config.geminiApiKey) return localRerankCandidates(prompt, candidates, count);

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
    return localRerankCandidates(prompt, candidates, count);
  }
}

// ── Route ──────────────────────────────────────────────────────────────────────

naturalRollRouter.post("/", validate(naturalRollBodySchema, "body"), async (req, res) => {
  const body = getValidated<NaturalRollBody>(req, "body");
  assertWithinRateLimit(getRateLimitKey(body, req.ip));

  const count = body.count ?? 4;

  // Stage 1: extract structural constraints
  const structuralFilters = await extractStructuralFilters(body.prompt);

  // Validate every emitted value against the DB-derived allowed lists: map
  // near-misses to canonical values, drop anything the catalog doesn't have —
  // so we never query with a value the model invented.
  const allowed = await getAllowedFilterValues();
  const { filters: cleaned, dropped } = validateStructuralFilters(structuralFilters, allowed);
  if (dropped.length > 0) {
    console.warn("Natural roll dropped invalid filter values:", dropped);
  }
  // What we actually queried with — remaps (canonical values) and drops are
  // already baked into `cleaned`; `appliedFilters`/`droppedFilters` get updated
  // again if we relax below, so the client always sees what really happened.
  let appliedFilters = cleaned;
  let droppedFilters = dropped;
  const query = randomQuerySchema.parse({ ...cleaned, userId: body.userId, limit: 1, page: 1 });

  // Stage 2: candidate pool — top 100 by IMDb rating, randomly sampled to 50
  let { films: candidates, total } = await getQualityCandidates(query, CANDIDATE_TOP_N, CANDIDATE_SAMPLE_N);

  // If no candidates, progressively loosen the soft constraints — genre first,
  // then category, language, and finally year — cumulatively dropping each
  // (only those actually applied) until something matches.
  let relaxed = false;
  if (candidates.length === 0) {
    const relaxable = RELAX_PRIORITY.filter(key => key in cleaned);
    const removed: string[] = [];

    for (const key of relaxable) {
      if (candidates.length > 0) break;
      removed.push(key);

      const overrides = Object.fromEntries(removed.map(k => [k, null]));
      const { filters: relaxedCleaned } = validateStructuralFilters(
        { ...structuralFilters, ...overrides },
        allowed,
      );
      const relaxedQuery = randomQuerySchema.parse({ ...relaxedCleaned, userId: body.userId, limit: 1, page: 1 });
      const relaxedResult = await getQualityCandidates(relaxedQuery, CANDIDATE_TOP_N, CANDIDATE_SAMPLE_N);

      candidates = relaxedResult.films;
      total = relaxedResult.total;
      appliedFilters = relaxedCleaned;
      droppedFilters = [...dropped, ...removed];
      relaxed = true;
    }
  }

  if (candidates.length === 0) {
    res.status(404).json({
      error: "No films match the interpreted filters",
      code: "NO_FILMS_FOUND",
      interpretedFilters: appliedFilters,
      droppedFilters,
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
    interpretedFilters: appliedFilters,
    droppedFilters,
    relaxed,
  });
});
