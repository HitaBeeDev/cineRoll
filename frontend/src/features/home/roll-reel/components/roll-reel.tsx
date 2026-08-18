"use client";

import {
  AnimatePresence,
  animate,
  motion,
  useAnimationFrame,
  useMotionValue,
  useTransform,
  type AnimationPlaybackControls,
} from "framer-motion";
import { useEffect, useRef } from "react";
import type { ReelFrameSpec } from "../reel-frame-spec";
import type { RollPhase } from "../roll-phase";
import { ROLL_TIMINGS } from "../roll-timings";
import { ReelFrame } from "./reel-frame";
import { ReelGrain } from "./reel-grain";
import { RollLeader } from "./roll-leader";

const STREAKS =
  "repeating-linear-gradient(180deg, rgba(255,255,255,0.055) 0px, rgba(255,255,255,0) 3px, rgba(255,255,255,0) 9px)";

/**
 * The strip that runs while a roll is in flight — and the roll's loading state.
 *
 * It does not stop when the animation floor is up; it stops when the film
 * arrives. A slow response gets a longer hunt rather than a stalled spinner,
 * which is the whole reason the skeleton is gone from this panel: there is no
 * longer a state where the roll is waiting and has nothing to show for it.
 *
 * The frames are rendered twice so the loop has no seam, and the strip's offset
 * is wrapped into one strip-height rather than run to infinity, so the numbers
 * stay small enough to be exact.
 */
export function RollReel({
  frames,
  phase,
  pace,
  showLeader,
}: {
  frames: ReelFrameSpec[];
  phase: RollPhase;
  pace: number;
  showLeader: boolean;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  /** 1 while the strip is at full speed, 0 at rest. Drives every speed cue. */
  const smear = useMotionValue(1);
  const flash = useMotionValue(0);

  const phaseRef = useRef<RollPhase>(phase);
  const spinStartedAtRef = useRef(0);
  const settleRef = useRef<AnimationPlaybackControls | null>(null);

  // The frame loop reads the phase from a ref rather than a closure, so it can
  // stay subscribed for the reel's whole life instead of tearing down and
  // resubscribing on every phase change. Written in an effect, which lands
  // before the next animation frame reads it.
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const stripHeight = frames.length * ROLL_TIMINGS.FRAME_HEIGHT;

  const textOpacity = useTransform(smear, [0, 1], [1, 0.26]);
  const streakOpacity = useTransform(smear, [0, 1], [0, 0.55]);
  const gateOpacity = useTransform(smear, [0, 1], [0.9, 0]);

  // The strip's own loop. It advances by elapsed time rather than by frame count
  // so a dropped frame costs distance, not sync, and it decays from "unreadable"
  // to "readable" across the spin instead of holding one speed and cutting.
  useAnimationFrame((_, delta) => {
    if (phaseRef.current !== "spin") return;
    // A backgrounded tab hands back one enormous delta on return; clamping it
    // keeps the strip from teleporting half a loop on the first frame back.
    const seconds = Math.min(delta, 48) / 1000;
    const elapsed = performance.now() - spinStartedAtRef.current;
    const speed =
      ROLL_TIMINGS.SPIN_SPEED_END +
      (ROLL_TIMINGS.SPIN_SPEED_START - ROLL_TIMINGS.SPIN_SPEED_END) *
        Math.exp(-elapsed / ROLL_TIMINGS.SPIN_SPEED_TAU);

    y.set(wrapOffset(y.get() - speed * seconds, stripHeight));
    smear.set(
      (speed - ROLL_TIMINGS.SPIN_SPEED_END) /
        (ROLL_TIMINGS.SPIN_SPEED_START - ROLL_TIMINGS.SPIN_SPEED_END),
    );
  });

  useEffect(() => {
    settleRef.current?.stop();

    if (phase === "spin") {
      spinStartedAtRef.current = performance.now();
      smear.set(1);
      // Start somewhere different every roll, so the strip is not seen dealing
      // the same word into the gate twice in a row.
      y.set(-Math.floor(Math.random() * frames.length) * ROLL_TIMINGS.FRAME_HEIGHT);
      return;
    }

    if (phase === "lock") {
      const viewportHeight = viewportRef.current?.clientHeight ?? 0;
      settleRef.current = animate(y, landingOffset(y.get(), viewportHeight), {
        duration: (ROLL_TIMINGS.LOCK_MS * pace) / 1000,
        // Overshoots the frame and snaps back onto it — the strip arrives, it
        // does not glide to a halt.
        ease: [0.34, 1.56, 0.64, 1],
      });
      animate(smear, 0, { duration: 0.18, ease: "easeOut" });
      animate(flash, [0, 0.8, 0], { duration: 0.26, times: [0, 0.18, 1], ease: "easeOut" });
      return;
    }

    if (phase === "misfire") {
      const from = y.get();
      settleRef.current = animate(y, [from, from - 24, from - 29, from - 31], {
        duration: (ROLL_TIMINGS.MISFIRE_MS * pace) / 1000,
        times: [0, 0.34, 0.62, 1],
        ease: "linear",
      });
      animate(smear, 0, { duration: 0.2, ease: "easeOut" });
    }
  }, [phase, pace, frames.length, y, smear, flash]);

  useEffect(() => () => settleRef.current?.stop(), []);

  // Twice through, so the wrap above always has strip under the viewport.
  const looped = [...frames, ...frames];

  return (
    <div
      ref={viewportRef}
      aria-hidden
      className="relative w-full flex-1 overflow-hidden rounded-xl border border-[#15151f] bg-[#050509] min-h-[380px] lg:min-h-[420px]"
    >
      <motion.div className="absolute inset-x-0 top-0" style={{ y }}>
        {looped.map((frame, index) => (
          <ReelFrame key={index} frame={frame} textOpacity={textOpacity} />
        ))}
      </motion.div>

      {/* Speed cues, all opacity: streaks over the strip, and the gate that
          fades up as the strip slows enough for a frame to sit in it. */}
      <motion.span
        className="pointer-events-none absolute inset-0 z-10"
        style={{ opacity: streakOpacity, backgroundImage: STREAKS }}
      />
      <motion.span
        className="pointer-events-none absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 border-y border-accent/40"
        style={{ opacity: gateOpacity, height: ROLL_TIMINGS.FRAME_HEIGHT }}
      />
      <span className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_88%_62%_at_50%_50%,transparent_38%,rgba(5,5,9,0.9)_100%)]" />

      <ReelGrain active={phase === "spin"} />

      <motion.span
        className="pointer-events-none absolute inset-0 z-30 bg-white"
        style={{ opacity: flash }}
      />

      {phase === "misfire" && (
        <div className="pointer-events-none absolute inset-x-0 top-1/2 z-30 flex -translate-y-1/2 items-center justify-center bg-[#07070d]" style={{ height: ROLL_TIMINGS.FRAME_HEIGHT }}>
          <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.34em] text-[#6a6a80]">
            No signal
          </span>
        </div>
      )}

      <AnimatePresence>
        {showLeader && phase === "press" && <RollLeader />}
      </AnimatePresence>
    </div>
  );
}

/** Keeps the offset inside one strip-height, where the content repeats exactly. */
function wrapOffset(offset: number, stripHeight: number): number {
  if (stripHeight <= 0) return offset;
  return ((offset % stripHeight) - stripHeight) % stripHeight;
}

/**
 * The offset that parks a frame dead centre in the gate, one frame further on
 * than wherever the strip currently is — so locking always travels rather than
 * stopping where it happened to be.
 */
function landingOffset(current: number, viewportHeight: number): number {
  const centred = viewportHeight / 2 - ROLL_TIMINGS.FRAME_HEIGHT / 2;
  const framesAbove = Math.ceil((centred - current) / ROLL_TIMINGS.FRAME_HEIGHT);
  return centred - (framesAbove + 1) * ROLL_TIMINGS.FRAME_HEIGHT;
}
