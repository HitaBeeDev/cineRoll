import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { ResponseSchema } from "@google/generative-ai";
import { Router } from "express";
import { z } from "zod";
import { config } from "../config";
import { RandomQuery, randomQuerySchema } from "../lib/filmFilters";
import { HttpError } from "../middleware/errorHandler";
import { getValidated, validate } from "../middleware/validate";
import { getRandomFilms } from "./random";

export const naturalRollRouter = Router();

const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const GEMINI_MODEL = "gemini-2.5-flash-lite";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const rateLimitBuckets = new Map<string, RateLimitBucket>();

const naturalRollBodySchema = z.object({
  prompt: z.string().trim().min(1).max(500),
  userId: z.string().trim().min(1).max(180).optional(),
  count: z.number().int().min(1).max(6).optional(),
}).strict();

const nullableString = z.union([z.string().trim().min(1), z.null()]);
const nullableBoolean = z.union([z.boolean(), z.null()]);
const nullableNumber = z.union([z.number(), z.null()]);

const geminiFilterSchema = z.object({
  search: nullableString.optional(),
  person: nullableString.optional(),
  director: nullableString.optional(),
  femaleDirectorOnly: nullableBoolean.optional(),
  awardBody: z.union([z.enum(["oscar", "goldenglobe", "cannes", "all"]), z.null()]).optional(),
  winnerOnly: nullableBoolean.optional(),
  nominatedOnly: nullableBoolean.optional(),
  category: nullableString.optional(),
  awardYear: nullableNumber.optional(),
  language: nullableString.optional(),
  genre: nullableString.optional(),
  contentType: nullableString.optional(),
  runtimeMax: nullableNumber.optional(),
  decadeMin: nullableNumber.optional(),
  decadeMax: nullableNumber.optional(),
  nominationCount: nullableNumber.optional(),
  imdbRatingMin: nullableNumber.optional(),
  imdbRatingMax: nullableNumber.optional(),
  rtScoreMin: nullableNumber.optional(),
  certificate: nullableString.optional(),
  imdbTopMoviesOnly: nullableBoolean.optional(),
  imdbTopTvOnly: nullableBoolean.optional(),
  tvType: nullableString.optional(),
}).strict();

type NaturalRollBody = z.infer<typeof naturalRollBodySchema>;

type GeminiFilters = z.infer<typeof geminiFilterSchema>;

const responseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    search: { type: SchemaType.STRING, nullable: true },
    person: { type: SchemaType.STRING, nullable: true },
    director: { type: SchemaType.STRING, nullable: true },
    femaleDirectorOnly: { type: SchemaType.BOOLEAN, nullable: true },
    awardBody: {
      type: SchemaType.STRING,
      format: "enum",
      enum: ["oscar", "goldenglobe", "cannes", "all"],
      nullable: true,
    },
    winnerOnly: { type: SchemaType.BOOLEAN, nullable: true },
    nominatedOnly: { type: SchemaType.BOOLEAN, nullable: true },
    category: { type: SchemaType.STRING, nullable: true },
    awardYear: { type: SchemaType.INTEGER, nullable: true },
    language: { type: SchemaType.STRING, nullable: true },
    genre: { type: SchemaType.STRING, nullable: true },
    contentType: { type: SchemaType.STRING, nullable: true },
    runtimeMax: { type: SchemaType.INTEGER, nullable: true },
    decadeMin: { type: SchemaType.INTEGER, nullable: true },
    decadeMax: { type: SchemaType.INTEGER, nullable: true },
    nominationCount: { type: SchemaType.INTEGER, nullable: true },
    imdbRatingMin: { type: SchemaType.NUMBER, nullable: true },
    imdbRatingMax: { type: SchemaType.NUMBER, nullable: true },
    rtScoreMin: { type: SchemaType.INTEGER, nullable: true },
    certificate: { type: SchemaType.STRING, nullable: true },
    imdbTopMoviesOnly: { type: SchemaType.BOOLEAN, nullable: true },
    imdbTopTvOnly: { type: SchemaType.BOOLEAN, nullable: true },
    tvType: { type: SchemaType.STRING, nullable: true },
  },
};

const systemInstruction = `
You convert a user's natural-language film request into CineRoll filter JSON.
Return only JSON. Use only these fields:
search, person, director, femaleDirectorOnly, awardBody, winnerOnly, nominatedOnly,
category, awardYear, language, genre, contentType, runtimeMax, decadeMin, decadeMax,
nominationCount, imdbRatingMin, imdbRatingMax, rtScoreMin, certificate,
imdbTopMoviesOnly, imdbTopTvOnly, tvType.

Rules:
- Accept the user's prompt in any language. Interpret localized genre, award, date,
  country, mood, and format phrases, then return the normalized JSON fields below.
- Keep output values in canonical app/API form, not the user's original language.
- Omit unknown or unsupported filters. Do not invent fields.
- Use awardBody only as "oscar", "goldenglobe", "cannes", or "all".
- For decades, use inclusive years, for example 1990s means decadeMin 1990 and decadeMax 1999.
- Use winnerOnly for winner requests and nominatedOnly for nomination requests.
- Use genre for broad genres such as Drama, Comedy, Horror, Romance, Documentary, Animation, Thriller, Crime, Action, Sci-Fi.
- Use contentType only when the user asks specifically for movie, series, miniseries, or similar.
- Use language as an ISO 639-1 two-letter code when the user asks for films in or from a specific language or country. Examples: French/France → "fr", Italian/Italy → "it", German/Germany → "de", Japanese/Japan → "ja", Spanish/Spain/Latin America → "es", Korean/Korea → "ko", Portuguese/Brazil → "pt", Chinese/China → "zh", Russian/Russia → "ru", Swedish/Sweden → "sv". Never put a nationality word in the search field.
- Only set runtimeMax when the user explicitly mentions a time constraint (e.g. "under 2 hours", "short film", "less than 90 minutes"). Do not infer or assume any runtime limit from mood, genre, or style.
- Prefer fewer precise filters over many speculative filters.
`.trim();

const relaxedInstruction = `
The previous filters matched zero films. Return a relaxed JSON filter object for the same request.
Keep the strongest one or two constraints only. Remove exact people, exact categories, strict ratings,
runtime limits, certificates, and other narrow constraints unless essential.
`.trim();

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
    throw new HttpError(
      429,
      "Natural roll limit reached. Try again later.",
      "RATE_LIMITED",
    );
  }

  existing.count += 1;
}

function parseGeminiJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return JSON.parse(fenced?.[1] ?? trimmed);
}

function parseGeminiFilters(text: string): GeminiFilters {
  try {
    return geminiFilterSchema.parse(parseGeminiJson(text));
  } catch {
    throw new HttpError(
      502,
      "Gemini returned invalid filter JSON",
      "GEMINI_INVALID_FILTERS",
    );
  }
}

function cleanGeminiFilters(filters: GeminiFilters): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => {
      if (value === null || value === undefined) return false;
      if (typeof value === "string" && value.trim() === "") return false;
      return true;
    }),
  );
}

function toRandomQuery(filters: GeminiFilters, userId: string | undefined): RandomQuery {
  const cleaned = cleanGeminiFilters(filters);
  return randomQuerySchema.parse({
    ...cleaned,
    userId,
    limit: 1,
    page: 1,
  });
}

async function interpretPrompt(prompt: string, retry: boolean): Promise<GeminiFilters> {
  if (!config.geminiApiKey) {
    throw new HttpError(503, "Gemini API key is not configured", "GEMINI_NOT_CONFIGURED");
  }

  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  const model = genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: retry
      ? `${systemInstruction}\n\n${relaxedInstruction}`
      : systemInstruction,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema,
      temperature: retry ? 0.2 : 0.35,
      maxOutputTokens: 512,
    },
  });

  const result = await model.generateContent(prompt);
  return parseGeminiFilters(result.response.text());
}

naturalRollRouter.post("/", validate(naturalRollBodySchema, "body"), async (req, res) => {
  const body = getValidated<NaturalRollBody>(req, "body");
  assertWithinRateLimit(getRateLimitKey(body, req.ip));

  const count = body.count ?? 4;
  const interpretedFilters = await interpretPrompt(body.prompt, false);
  const query = toRandomQuery(interpretedFilters, body.userId);
  const firstResult = await getRandomFilms(query, count);

  if (firstResult.films.length > 0) {
    res.json({
      films: firstResult.films,
      total: firstResult.total,
      interpretedFilters: cleanGeminiFilters(interpretedFilters),
      relaxed: false,
    });
    return;
  }

  const relaxedFilters = await interpretPrompt(body.prompt, true);
  const relaxedQuery = toRandomQuery(relaxedFilters, body.userId);
  const relaxedResult = await getRandomFilms(relaxedQuery, count);

  if (relaxedResult.films.length === 0) {
    res.status(404).json({
      error: "No films match the interpreted filters",
      code: "NO_FILMS_FOUND",
      interpretedFilters: cleanGeminiFilters(relaxedFilters),
    });
    return;
  }

  res.json({
    films: relaxedResult.films,
    total: relaxedResult.total,
    interpretedFilters: cleanGeminiFilters(relaxedFilters),
    relaxed: true,
  });
});
