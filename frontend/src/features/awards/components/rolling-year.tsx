"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

const ROLL = {
  enter: (direction: number) => ({ y: direction > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { y: "0%", opacity: 1 },
  exit: (direction: number) => ({ y: direction > 0 ? "-100%" : "100%", opacity: 0 }),
};

/**
 * A year that rolls like a counter when it changes: the new year slides up
 * from below when moving forward in time, down from above when moving back.
 * Clipped to one line, so only one year is ever readable.
 */
export function RollingYear({ year }: { year: number }) {
  const reduceMotion = useReducedMotion();
  // Previous value kept in state and compared during render (React's pattern
  // for deriving from a change), so the direction is known on the same render.
  const [previous, setPrevious] = useState(year);
  const [direction, setDirection] = useState(1);
  if (year !== previous) {
    setDirection(year > previous ? 1 : -1);
    setPrevious(year);
  }

  return (
    <span className="relative inline-flex overflow-hidden pb-[0.08em] align-bottom tabular-nums">
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.span
          key={year}
          custom={direction}
          variants={ROLL}
          initial="enter"
          animate="center"
          exit="exit"
          transition={
            reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36, mass: 0.6 }
          }
          className="inline-block"
        >
          {year}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
