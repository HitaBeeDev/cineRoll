export const RANDOM_COUNT_TTL_MS = 60 * 1000;
export const PERSONALIZED_POOL_SIZE = 300;
// Candidate sample the base roll draws before applying §6 session-diversity
// weighting. Big enough to almost always contain titles that break the recent
// genre/type/decade streak; small enough to keep the roll query cheap.
export const DIVERSITY_SAMPLE_SIZE = 40;
export const EXPLORATION_EPSILON = 0.15;
export const SOFTMAX_TEMPERATURE = 0.5;
