export const DAY_MS = 1000 * 60 * 60 * 24;

export const TASTE_PROFILE_CONFIG = {
  coldStartSeed: 0.5,
  coldStartThreshold: 3,
  staleMaxAgeMs: 7 * DAY_MS,
} as const;
