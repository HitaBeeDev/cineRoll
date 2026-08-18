/**
 * How much of the full sequence this roll gets, as a multiplier on every
 * duration in `ROLL_TIMINGS`.
 *
 * A 1.2s performance is right the first time and tiresome by the fifth. People
 * re-roll in bursts — three or four in ten seconds is normal use, not impatience
 * — so the sequence gets out of the way as the burst goes on and comes back at
 * full length once the session has calmed down.
 */
export function computeRollPace({
  rollCount,
  msSinceLastRoll,
}: {
  /** Rolls already served this session, before this one. */
  rollCount: number;
  /** Time since the last roll finished. `Infinity` when there wasn't one. */
  msSinceLastRoll: number;
}): number {
  if (rollCount === 0) return 1;
  // A re-roll inside three seconds is someone flicking through the pool. Give
  // them the shape of the sequence and nothing else.
  if (msSinceLastRoll < 3000) return 0.28;
  return 0.6;
}
