export const NATURAL_ROLL_LIMITS = {
  candidateSample: 50,
  candidateTop: 100,
  defaultCount: 4,
  rateLimitMax: 10,
  rateLimitWindowMs: 60 * 60 * 1000,
} as const;

export const GEMINI_MODEL = "gemini-2.5-flash-lite";

export const RELAX_PRIORITY = [
  "genre",
  "category",
  "language",
  "awardYear",
  "decadeMin",
  "decadeMax",
] as const;
