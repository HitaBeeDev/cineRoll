/**
 * The roll's own clock, in milliseconds, at full pace.
 *
 * These exist because the roll used to be timed by the network: a fast response
 * was a 200ms flicker, a slow one a dead skeleton, and neither was a moment. The
 * request still fires immediately — the reveal waits for the response *and* the
 * floor below, so the sequence reads the same on every connection.
 *
 * Everything except FRAME_HEIGHT and the speeds is scaled by the pace factor
 * (see `computeRollPace`), so a fifth re-roll in a row is not a fifth full
 * performance.
 */
export const ROLL_TIMINGS = {
  /** Button squish, ring push, house lights down. */
  PRESS_MS: 150,
  /** Projector leader (3·2·1) — first roll of a session only. */
  LEADER_MS: 1500,
  /** Floor for the spin. The reel keeps looping past this if the film is late. */
  SPIN_MIN_MS: 700,
  /** Overshoot and snap onto the winning frame. */
  LOCK_MS: 220,
  /** Frame grows into the card and the card's information cascades in. */
  BLOOM_MS: 520,
  /** A roll that came back with nothing: the strip stutters and dies. */
  MISFIRE_MS: 620,

  /** One frame of film, in px. The gate at the centre of the reel is this tall. */
  FRAME_HEIGHT: 104,
  /** px/s at the instant the strip is released. */
  SPIN_SPEED_START: 2600,
  /** px/s it decays toward, where the words become readable again. */
  SPIN_SPEED_END: 560,
  /** Decay constant for that fall, in ms. */
  SPIN_SPEED_TAU: 380,
} as const;
