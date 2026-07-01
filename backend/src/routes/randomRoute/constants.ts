export const RANDOM_COUNT_TTL_MS = 60 * 1000;
export const PERSONALIZED_POOL_SIZE = 300;
// Candidate sample the base roll draws before applying §6/§7 weighted scoring.
// Big enough to almost always contain titles that break the recent
// genre/type/decade streak; small enough to keep the roll query cheap.
export const DIVERSITY_SAMPLE_SIZE = 40;
// Softmax temperature for turning §7 roll scores (~0–100 range) into pick
// weights. Higher = flatter (more random); lower = peakier (more deterministic).
// Tuned so a ~50-point score gap gives a strong but non-absolute bias, keeping
// the roll "better titles win more often, but not always."
export const ROLL_SCORE_TEMPERATURE = 25;
export const EXPLORATION_EPSILON = 0.15;
export const SOFTMAX_TEMPERATURE = 0.5;
