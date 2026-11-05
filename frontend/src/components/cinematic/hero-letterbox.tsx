"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Black letterbox bars that open from a narrow widescreen frame to a thin
 * matte as the page loads — the frame widening, like a projector coming up.
 * The headline under them stays fully painted, so this never delays LCP.
 */
export function HeroLetterbox() {
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 1.4, delay: 0.15, ease: [0.65, 0, 0.35, 1] as const };

  return (
    <>
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-24 origin-top bg-black"
        initial={{ scaleY: reduceMotion ? 0.25 : 1 }}
        animate={{ scaleY: 0.25 }}
        transition={transition}
      />
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24 origin-bottom bg-black"
        initial={{ scaleY: reduceMotion ? 0.25 : 1 }}
        animate={{ scaleY: 0.25 }}
        transition={transition}
      />
    </>
  );
}
