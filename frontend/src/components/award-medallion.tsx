"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * The gold disc behind a ceremony glyph, with its ring drawn on rather than
 * printed.
 *
 * The accolade is the reason the film is on the page, and a ring that completes
 * itself is the one gesture that says *earned* instead of *labelled*. It runs
 * once, on the way in, and stays a full circle for the rest of the visit — this
 * is an entrance, not a meter.
 */
export function AwardMedallion({
  gold,
  delay,
  children,
}: {
  gold: string;
  /** Staggers the band so the rings complete in sequence, not in unison. */
  delay: number;
  children: ReactNode;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <span
      className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
      style={{
        background: `${gold}1c`,
        color: gold,
        boxShadow: `inset 0 0 0 1px ${gold}3d, 0 0 24px ${gold}1f`,
      }}
    >
      {/* Rotated so the stroke starts at twelve o'clock rather than three. */}
      <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden>
        <motion.circle
          cx="24"
          cy="24"
          r="23"
          fill="none"
          stroke={gold}
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: reducedMotion ? 1 : 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }
          }
        />
      </svg>
      {children}
    </span>
  );
}
