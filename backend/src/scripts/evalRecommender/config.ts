import { resolve } from "node:path";

/** Where per-modelVersion results are recorded for cross-version comparison. */
export const RESULTS_PATH = resolve(process.cwd(), "eval-results/recommender.json");

/** A user needs at least this many liked films to be a valid test case. */
export const MIN_LIKED = 5;

/** Fraction of a user's liked films to hold out, capped by HOLDOUT_MAX. */
export const HOLDOUT_FRACTION = 0.3;
export const HOLDOUT_MAX = 5;

/** Mirror the recommender's cold-start gate: below this, it serves nothing. */
export const COLD_START_MIN = 3;

export const DEFAULT_K_VALUES = [5, 10, 20];
