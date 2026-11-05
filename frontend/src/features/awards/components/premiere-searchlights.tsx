"use client";

import { motion, useReducedMotion } from "framer-motion";

// The blur sits on the rotating wrapper and the cone cut on its child, so the
// blur softens the cone's edges instead of being clipped away by them.
const BEAM_CLASS = "pointer-events-none absolute bottom-0 -z-10 h-[135%] w-56 origin-bottom blur-2xl";
const CONE_CLASS =
  "block h-full w-full bg-[linear-gradient(to_top,rgba(212,175,55,0.3),rgba(212,175,55,0.07)_55%,transparent_85%)] [clip-path:polygon(44%_100%,56%_100%,100%_0,0_0)]";

/**
 * Two gold premiere searchlights rising from the foot of the hero and swaying
 * out of step, like the beams outside a ceremony. Rotation only, so it stays on
 * the compositor; with reduced motion they hold still at a slight angle.
 */
export function PremiereSearchlights() {
  const reduceMotion = useReducedMotion();

  return (
    <>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-40 bg-[radial-gradient(ellipse_at_bottom,rgba(212,175,55,0.14),transparent_70%)]"
      />
      <motion.span
        aria-hidden
        className={`${BEAM_CLASS} left-[8%]`}
        initial={{ rotate: 14 }}
        animate={reduceMotion ? { rotate: 14 } : { rotate: [14, -6, 14] }}
        transition={{ duration: 11, ease: "easeInOut", repeat: Infinity }}
      >
        <span className={CONE_CLASS} />
      </motion.span>
      <motion.span
        aria-hidden
        className={`${BEAM_CLASS} right-[10%]`}
        initial={{ rotate: -12 }}
        animate={reduceMotion ? { rotate: -12 } : { rotate: [-12, 8, -12] }}
        transition={{ duration: 14, ease: "easeInOut", repeat: Infinity, delay: 1.5 }}
      >
        <span className={CONE_CLASS} />
      </motion.span>
    </>
  );
}
