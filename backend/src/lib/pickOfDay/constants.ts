export const DAY_MS = 24 * 60 * 60 * 1000;

export const PICK_OF_DAY_CONFIG = {
  /** A film can't be pick-of-day twice within a year. */
  noRepeatDays: 365,
  /** Top-prestige candidates considered per day. */
  poolSize: 800,
  /** How far back rollCount looks when measuring exposure. */
  rollWindowDays: 14,
  // Scoring weights relative to quality's implicit 1.0: jitter (0.5) and
  // under-exposure (0.45) can together outvote quality, so the pick rotates
  // through the deserving pool instead of walking it in prestige order.
  weightDailySeed: 0.5,
  weightUnderExposure: 0.45,
} as const;
