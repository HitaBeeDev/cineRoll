/**
 * One frame of the strip. A `word` frame carries a term from the pool being
 * searched; a `blank` frame is exposed stock, and its `seed` picks which of the
 * light-leak treatments it wears so consecutive blanks don't look stamped.
 */
export type ReelFrameSpec =
  | { kind: "word"; text: string }
  | { kind: "blank"; seed: number };
