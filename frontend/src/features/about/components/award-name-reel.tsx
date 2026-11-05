"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AWARD_BODIES } from "@/features/awards/award-bodies";

const NAMES = AWARD_BODIES.map((body) => body.name);

/**
 * The four award names drifting across the hero like an end-credit crawl.
 * Two copies of the row sit side by side and slide by exactly one copy's width,
 * so the loop has no seam. Decorative: the same names are in the copy below.
 */
export function AwardNameReel() {
  const reduceMotion = useReducedMotion();
  const row = (copy: number) => (
    <div className="flex shrink-0 items-center" aria-hidden key={copy}>
      {NAMES.map((name) => (
        <span key={name} className="flex items-center">
          <span className="whitespace-nowrap px-8 font-[family-name:var(--font-display)] text-6xl font-bold italic text-transparent [-webkit-text-stroke:1px_rgba(245,245,240,0.14)] sm:text-8xl">
            {name}
          </span>
          <span className="h-2 w-2 shrink-0 rounded-full bg-accent/60" />
        </span>
      ))}
    </div>
  );

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-10 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_15%,black_85%,transparent)]">
      <motion.div
        className="flex w-max"
        animate={reduceMotion ? { x: "0%" } : { x: ["0%", "-50%"] }}
        transition={{ duration: 60, ease: "linear", repeat: Infinity }}
      >
        {row(0)}
        {row(1)}
      </motion.div>
    </div>
  );
}
