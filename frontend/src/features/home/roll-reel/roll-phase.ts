/**
 * Where the roll is in its sequence.
 *
 * `idle` covers both "nothing rolled yet" and "a film is sitting on screen" —
 * the difference is whether a film has been revealed, which is not this type's
 * business. Everything between `press` and `misfire` means the reel owns the
 * panel.
 */
export type RollPhase = "idle" | "press" | "spin" | "lock" | "bloom" | "misfire";
