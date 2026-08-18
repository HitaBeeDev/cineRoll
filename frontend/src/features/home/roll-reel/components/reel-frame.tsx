"use client";

import { motion, type MotionValue } from "framer-motion";
import { ROLL_TIMINGS } from "../roll-timings";
import type { ReelFrameSpec } from "../reel-frame-spec";

/** Three light-leak washes, so a run of blanks reads as stock rather than tiles. */
const LEAK_BY_SEED = [
  "radial-gradient(ellipse 70% 55% at 22% 30%, rgba(232,69,60,0.10), transparent 70%)",
  "radial-gradient(ellipse 60% 70% at 78% 62%, rgba(255,255,255,0.055), transparent 72%)",
  "radial-gradient(ellipse 90% 45% at 50% 90%, rgba(232,69,60,0.07), transparent 75%)",
];

/**
 * One frame of the strip: perforated on both edges, a term from the pool in the
 * middle. The sprocket holes ride inside the frame rather than sitting in fixed
 * columns beside it, because they are part of the film — they have to travel
 * with it or the strip reads as a list scrolling behind a static border.
 *
 * `textOpacity` is the stand-in for motion blur. A real `filter: blur()` on
 * something moving at 2600px/s is the classic way to lose a frame budget on a
 * mid-range phone; fading the word out at speed and back in as the strip slows
 * costs one compositor property and lands the same read — a smear that resolves
 * into a word you can suddenly make out.
 */
export function ReelFrame({
  frame,
  textOpacity,
}: {
  frame: ReelFrameSpec;
  textOpacity: MotionValue<number>;
}) {
  return (
    <div
      className="relative flex w-full items-center justify-between border-b border-[#101019] bg-[#07070d]"
      style={{ height: ROLL_TIMINGS.FRAME_HEIGHT }}
    >
      <SprocketPair />

      <div className="relative flex min-w-0 flex-1 items-center justify-center px-3">
        {frame.kind === "word" ? (
          <motion.span
            style={{ opacity: textOpacity }}
            className="truncate font-[family-name:var(--font-geist-mono)] text-[13px] font-semibold uppercase tracking-[0.3em] text-[#d5d1e4] sm:text-[15px]"
          >
            {frame.text}
          </motion.span>
        ) : (
          <span
            aria-hidden
            className="absolute inset-0"
            style={{ background: LEAK_BY_SEED[frame.seed % LEAK_BY_SEED.length] }}
          />
        )}
      </div>

      <SprocketPair />
    </div>
  );
}

function SprocketPair() {
  return (
    <span
      aria-hidden
      className="flex h-full w-[26px] shrink-0 flex-col items-center justify-around bg-[#050509] py-3"
    >
      <span className="h-[13px] w-[9px] rounded-[2px] bg-[#14141f]" />
      <span className="h-[13px] w-[9px] rounded-[2px] bg-[#14141f]" />
    </span>
  );
}
