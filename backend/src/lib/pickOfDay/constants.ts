export const DAY_MS = 24 * 60 * 60 * 1000;

export const PICK_OF_DAY_CONFIG = {
  noRepeatDays: 365,
  poolSize: 800,
  rollWindowDays: 14,
  weightDailySeed: 0.5,
  weightUnderExposure: 0.45,
} as const;
