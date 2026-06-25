export const MODEL_VERSION = "content-v1";

export const RECOMMENDER_LIMITS = {
  coldStartMinSignals: 3,
  defaultLimit: 6,
  poolSize: 300,
  topGenres: 6,
} as const;

export const SCORE_DIMENSIONS = {
  award: 0.6,
  decade: 0.4,
  director: 0.8,
  genre: 1.0,
  rating: 0.4,
  runtime: 0.3,
} as const;

export const RECENCY_BASE_YEAR = 1920;
