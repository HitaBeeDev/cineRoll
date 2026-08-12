"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

/**
 * A rating glyph's icon, with the one flourish in the action row.
 *
 * "Loved it" is the emotional peak of this interaction, and it's the only
 * control here where a filled shape appears out of an outline — so it gets a
 * spring pop, the way a heart does everywhere people already know hearts from.
 * Nothing else in the row animates on activation; spending the flourish once is
 * what keeps it from reading as decoration.
 *
 * The `key` flip is what makes it fire exactly once per activation: changing it
 * remounts the span, so `initial` → `animate` runs on the way in and never
 * re-runs on an unrelated re-render. Turning the rating OFF passes
 * `initial={false}`, so clearing a rating is silent.
 */
export function RatingGlyph({
  Icon,
  active,
  pop,
  fillWhenActive,
  className,
}: {
  Icon: LucideIcon;
  active: boolean;
  pop: boolean;
  fillWhenActive: boolean;
  className: string;
}) {
  const reduceMotion = useReducedMotion();
  const animate = pop && active && !reduceMotion;

  return (
    <motion.span
      key={animate ? "on" : "off"}
      initial={animate ? { scale: 0.55 } : false}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 520, damping: 15 }}
      className="flex items-center justify-center"
    >
      <Icon
        className={className}
        fill={fillWhenActive && active ? "currentColor" : "none"}
        aria-hidden
      />
    </motion.span>
  );
}
