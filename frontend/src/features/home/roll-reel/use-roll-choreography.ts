"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RollFilm } from "@/lib/api";
import { computeRollPace } from "./compute-roll-pace";
import type { RollPhase } from "./roll-phase";
import { ROLL_TIMINGS } from "./roll-timings";

type RollChoreography = {
  phase: RollPhase;
  /** Multiplier applied to every duration this roll — see `computeRollPace`. */
  pace: number;
  /** The film once the reel has locked onto it. Null while the strip is running. */
  revealedFilm: RollFilm | null;
  /** Whether this roll opens on the projector leader (first roll of a session). */
  showLeader: boolean;
};

/**
 * The roll's clock.
 *
 * The session hook owns the request; this owns how long the roll *takes*. The
 * two are deliberately separate: the request goes out the instant the button is
 * pressed, and the reveal waits for whichever finishes last — the response or
 * the animation floor. A fast connection gets the choreography, a slow one gets
 * a longer hunt, and neither ever shows a half-second of skeleton.
 *
 * A roll that comes back with nothing lands on `misfire` instead of `lock`: the
 * strip stutters and dies rather than the panel blinking to an error.
 *
 * Both ends of a roll are driven from one effect watching `isRolling` change,
 * rather than two effects with a shared "in flight" flag. The flag version can
 * strand: any path that opens it without closing it leaves every later roll
 * silently ignored, with the previous film still on screen. Comparing against
 * the last value cannot get stuck — the worst case is a missed frame, not a
 * dead button.
 */
export function useRollChoreography({
  film,
  isRolling,
  reducedMotion,
}: {
  film: RollFilm | null;
  isRolling: boolean;
  reducedMotion: boolean | null;
}): RollChoreography {
  const [phase, setPhase] = useState<RollPhase>("idle");
  const [pace, setPace] = useState(1);
  const [revealed, setRevealed] = useState<RollFilm | null>(null);
  const [showLeader, setShowLeader] = useState(false);

  const paceRef = useRef(1);
  const timersRef = useRef<number[]>([]);
  const spinStartsAtRef = useRef(0);
  const rollCountRef = useRef(0);
  const lastRollEndRef = useRef(Number.NEGATIVE_INFINITY);
  // The last `isRolling` this effect acted on. Re-running the effect without a
  // change — React's development double-invoke, or an unrelated re-render — is
  // a no-op rather than a restart.
  const actedOnRef = useRef(false);

  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) window.clearTimeout(timer);
    timersRef.current = [];
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    if (isRolling === actedOnRef.current) return;
    actedOnRef.current = isRolling;

    // The press. Leader → press → spin, with the spin's start time recorded now
    // so the floor can be measured against it even from inside the press.
    if (isRolling) {
      clearTimers();
      const now = performance.now();
      const nextPace = computeRollPace({
        rollCount: rollCountRef.current,
        msSinceLastRoll: now - lastRollEndRef.current,
      });
      const withLeader = rollCountRef.current === 0;
      rollCountRef.current += 1;
      paceRef.current = nextPace;

      setPace(nextPace);
      setShowLeader(withLeader);
      setRevealed(null);
      setPhase("press");

      const leadIn =
        (withLeader ? ROLL_TIMINGS.LEADER_MS : 0) + ROLL_TIMINGS.PRESS_MS * nextPace;
      spinStartsAtRef.current = now + leadIn;
      later(() => setPhase("spin"), leadIn);
      return;
    }

    // The request has landed. Hold the reveal until the strip has had its floor,
    // then lock — or stutter out, if the roll came back empty-handed.
    const currentPace = paceRef.current;
    const floorEndsAt = spinStartsAtRef.current + ROLL_TIMINGS.SPIN_MIN_MS * currentPace;
    later(() => {
      if (!film) {
        setPhase("misfire");
        later(() => {
          setPhase("idle");
          lastRollEndRef.current = performance.now();
        }, ROLL_TIMINGS.MISFIRE_MS * currentPace);
        return;
      }

      setPhase("lock");
      later(() => {
        setRevealed(film);
        setPhase("bloom");
        lastRollEndRef.current = performance.now();
        later(() => setPhase("idle"), ROLL_TIMINGS.BLOOM_MS * currentPace);
      }, ROLL_TIMINGS.LOCK_MS * currentPace);
    }, Math.max(0, floorEndsAt - performance.now()));
  }, [isRolling, film, reducedMotion, clearTimers, later]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  if (reducedMotion) {
    return { phase: "idle", pace: 0, revealedFilm: film, showLeader: false };
  }
  return { phase, pace, revealedFilm: revealed, showLeader };
}
