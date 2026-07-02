export const OPTION_COUNT = 4;
export const DISTRACTOR_COUNT = OPTION_COUNT - 1; // target + 3 decoys

// How many same-decade films to pull and rank before choosing decoys.
export const CANDIDATE_POOL_SIZE = 60;

// If a decade is thinner than this, broaden the pool to the whole catalog so a
// sparse era never dead-ends a round.
export const MIN_DECADE_POOL = 12;

// Difficulty picks how *confusable* the decoys are, expressed as the fractional
// window of the similarity-ranked candidate list (index 0 = most similar to the
// answer). Hard → the top slice (near-identical award/decade profile, hardest to
// rule out); Easy → a far slice (clearly different, easy to eliminate).
export const DIFFICULTY_BANDS = {
  easy: [0.55, 1.0],
  medium: [0.2, 0.6],
  hard: [0.0, 0.25],
} as const satisfies Record<string, readonly [number, number]>;

export type Difficulty = keyof typeof DIFFICULTY_BANDS;
