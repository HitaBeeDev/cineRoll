export const NATURAL_ROLL_LIMITS = {
  candidateSample: 50,
  candidateTop: 100,
  defaultCount: 4,
  rateLimitMax: 10,
  rateLimitWindowMs: 60 * 60 * 1000,
} as const;

export const GEMINI_MODEL = "gemini-2.5-flash-lite";

// Stage-1 extraction runs near-deterministically (temperature 0.1) so the same
// prompt maps to the same structural filters. Caching that mapping skips a
// Gemini round-trip on repeats. A day is plenty: the cache is in-memory and
// resets on deploy anyway (which is also when the extraction prompt changes).
export const EXTRACT_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// Structural (Stage-1) filter keys, in the order they're dropped when the
// filtered pool comes back empty. contentType is deliberately absent: movie vs
// series is a hard constraint and must never be relaxed away.
export const RELAX_PRIORITY = [
  "genres",
  "category",
  "language",
  "awardYear",
  "decadeMin",
  "decadeMax",
] as const;
