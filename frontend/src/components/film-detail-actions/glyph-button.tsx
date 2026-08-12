"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { HoverTooltip } from "@/components/hover-tooltip";
import { GLYPH_BUTTON } from "@/components/film-detail-actions/styles/glyph-button";
import { GLYPH_IDLE } from "@/components/film-detail-actions/styles/glyph-idle";

/**
 * One circular glyph action, labelled on hover and focus.
 *
 * `activeClassName` is passed in rather than shared, because "on" means
 * something different for each glyph: watched is an achievement and inverts to
 * a solid fill, a rating is a verdict and lights a ring, hiding a film is a
 * negative and stays deliberately quiet.
 */
export function GlyphButton({
  label,
  active,
  activeClassName,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  activeClassName: string;
  disabled?: boolean | undefined;
  onClick: () => void;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <HoverTooltip label={label}>
      <motion.button
        type="button"
        aria-pressed={active}
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
        {...(reduceMotion ? {} : { whileTap: { scale: 0.92 } })}
        transition={{ duration: 0.12 }}
        className={cn(GLYPH_BUTTON, active ? activeClassName : GLYPH_IDLE)}
      >
        {children}
      </motion.button>
    </HoverTooltip>
  );
}
