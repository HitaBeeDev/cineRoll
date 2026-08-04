"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * The wait between asking for a roll and getting one.
 *
 * A spinner would do the job in the sense that it says "wait", and would waste
 * the one moment in the product where waiting is the point: the roll is a draw,
 * and a draw wants a beat of suspense before the answer. So the loader is the
 * thing a draw looks like on film — an Academy leader counting down between two
 * running sprocket strips, with the light sweeping across the gate.
 *
 * It runs for as long as the request takes and no longer. There is no minimum
 * hold: a fast answer is a good answer, and padding it to admire the animation
 * would be spending the user's time on our own decoration.
 */

/** Height of one sprocket cell. The strip animates by an exact multiple of it,
 *  which is what makes an endless loop out of a finite column of holes. */
const CELL = 18;
const CELLS = 26;
const LOOP_CELLS = 6;

function SprocketStrip({ side, animate }: { side: "left" | "right"; animate: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-y-0 w-7 overflow-hidden bg-[#050509]",
        side === "left" ? "left-0 border-r border-[#15151f]" : "right-0 border-l border-[#15151f]",
      )}
    >
      <motion.div
        className="flex flex-col items-center"
        animate={animate ? { y: [0, -CELL * LOOP_CELLS] } : { y: 0 }}
        transition={{ duration: 1.1, ease: "linear", repeat: Infinity }}
      >
        {Array.from({ length: CELLS }).map((_, index) => (
          <div key={index} style={{ height: CELL }} className="flex w-full items-center justify-center">
            <div className="h-2.5 w-3.5 rounded-[2px] bg-[#14141d]" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function RollProjector() {
  const reducedMotion = useReducedMotion() ?? false;
  const [count, setCount] = useState(3);

  // 3 · 2 · 1, then hold at 1 rather than wrapping back to 3 — a leader that
  // counts down and starts over says the wait has restarted, which it has not.
  useEffect(() => {
    if (reducedMotion) return;
    const tick = window.setInterval(() => setCount((n) => (n > 1 ? n - 1 : n)), 480);
    return () => window.clearInterval(tick);
  }, [reducedMotion]);

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-10">
      <div className="relative flex h-44 w-full items-center justify-center overflow-hidden rounded-xl border border-[#15151f] bg-[#08080e]">
        <SprocketStrip side="left" animate={!reducedMotion} />
        <SprocketStrip side="right" animate={!reducedMotion} />

        {/* The gate light passing across the frame. Low opacity on purpose: it
            should read as the projector breathing, not as a loading bar. */}
        {!reducedMotion && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#e8453c]/12 to-transparent"
            animate={{ x: ["-140%", "240%"] }}
            transition={{ duration: 2.2, ease: "easeInOut", repeat: Infinity }}
          />
        )}

        {/* Academy leader: ring, crosshair, sweeping hand, number in the middle. */}
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-[#e8453c]/30">
          <span aria-hidden className="absolute h-full w-px bg-[#e8453c]/15" />
          <span aria-hidden className="absolute h-px w-full bg-[#e8453c]/15" />

          {!reducedMotion && (
            <motion.div
              aria-hidden
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.44, ease: "linear", repeat: Infinity }}
            >
              <div className="absolute left-1/2 top-0 h-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-[#ff766d] to-transparent" />
            </motion.div>
          )}

          <motion.span
            key={count}
            initial={reducedMotion ? false : { opacity: 0.35, scale: 1.25 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="font-[family-name:var(--font-geist-mono)] text-3xl font-semibold text-[#ff766d]"
          >
            {count}
          </motion.span>
        </div>
      </div>

      <p
        role="status"
        className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.22em] text-[#8e899e]"
      >
        Threading the reel
      </p>
    </div>
  );
}
