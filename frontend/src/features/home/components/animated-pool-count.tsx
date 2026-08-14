"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { AnimatedPoolCountProps } from "../component-props";

export function AnimatedPoolCount({ value }: AnimatedPoolCountProps) {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) {
    return <span className="font-[family-name:var(--font-geist-mono)] text-[2rem] font-bold leading-none text-fg-hi">{value}</span>;
  }

  return (
    <span aria-live="polite" aria-atomic="true" className="inline-flex font-[family-name:var(--font-geist-mono)] text-[2rem] font-bold leading-none text-fg-hi">
      <span className="sr-only">{value}</span>
      {/* Keyed from the RIGHT: digits keep their slot as the number changes
          length, the way an odometer does. Keying from the left renamed every
          digit the moment the count grew a place, so each slot animated a new
          character in while the old one was still leaving. */}
      {[...value].map((character, index) => (
        <span key={value.length - index} aria-hidden className="relative inline-block overflow-hidden leading-none">
          <span className="invisible select-none">{character}</span>
          <AnimatePresence mode="sync" initial={false}>
            <motion.span key={character} initial={{ y: "-110%" }} animate={{ y: "0%" }} exit={{ y: "110%" }} transition={{ duration: 0.28, ease: [0.33, 1, 0.68, 1] }} className="absolute inset-0 flex items-center justify-center">{character}</motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}
