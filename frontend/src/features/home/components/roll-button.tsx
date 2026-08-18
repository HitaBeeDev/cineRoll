"use client";

import { motion, useReducedMotion, useSpring } from "framer-motion";
import type { PointerEvent } from "react";
import { cn } from "@/lib/utils/cn";
import type { RollButtonProps } from "../component-props";

/** How far the button will lean toward the cursor, in px. */
const MAGNET_RANGE = 6;

export function RollButton({ disabled, effectiveCount, effectiveCountLoading, hasActiveFilters, isRolling, shouldPulse, onRoll }: RollButtonProps) {
  const reducedMotion = useReducedMotion();
  const magnetX = useSpring(0, { stiffness: 260, damping: 20, mass: 0.5 });
  const magnetY = useSpring(0, { stiffness: 260, damping: 20, mass: 0.5 });

  const noMatches = hasActiveFilters && effectiveCount === 0;
  const label = isRolling
    ? "Rolling…"
    : noMatches
      ? "No matches"
      : hasActiveFilters && effectiveCount !== null && !effectiveCountLoading
        ? `Roll from ${effectiveCount} films`
        : "Roll for a random film";

  // The lean is small on purpose. A button that chases the cursor is a button
  // you have to catch; this one just acknowledges that you are coming.
  const lean = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || disabled || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    magnetX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * MAGNET_RANGE * 2);
    magnetY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * MAGNET_RANGE * 2);
  };
  const settle = () => {
    magnetX.set(0);
    magnetY.set(0);
  };

  return (
    <motion.div
      className="relative w-full shrink-0 rounded-2xl p-1.5 sm:w-[185px]"
      style={{ x: magnetX, y: magnetY }}
      onPointerMove={lean}
      onPointerLeave={settle}
      animate={shouldPulse ? { boxShadow: ["0 0 0px rgba(232,69,60,0)", "0 0 28px rgba(232,69,60,0.42)", "0 0 0px rgba(232,69,60,0)"] } : { boxShadow: "0 0 0px rgba(232,69,60,0)" }}
      transition={shouldPulse ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.5 }}
    >
      {/* The dashed ring, drawn as SVG rather than a CSS border so the dashes can
          march. A rotating border would spin the button's corners; marching the
          dash pattern instead reads as film moving through a gate, which is the
          one piece of motion this control is allowed to have at rest.
          `overflow-visible` keeps the stroke from being clipped in half by its
          own box. */}
      <svg aria-hidden className="pointer-events-none absolute inset-[1px] h-[calc(100%-2px)] w-[calc(100%-2px)] overflow-visible">
        <motion.rect
          width="100%"
          height="100%"
          rx="15"
          fill="none"
          stroke="rgba(232,69,60,0.32)"
          strokeWidth="2"
          strokeDasharray="10 8"
          animate={reducedMotion ? { strokeDashoffset: 0 } : { strokeDashoffset: [0, -36] }}
          transition={reducedMotion ? { duration: 0 } : { duration: 2.4, repeat: Infinity, ease: "linear" }}
        />
      </svg>

      <button onClick={onRoll} disabled={disabled} aria-label={label} className={cn("relative flex h-[64px] w-full items-center justify-center rounded-xl", "bg-accent text-ink-900", "font-[family-name:var(--font-geist-mono)] font-bold uppercase", "select-none transition-all duration-150", "hover:bg-[#d5342b] hover:shadow-[0_0_40px_rgba(232,69,60,0.28)]", "active:scale-[0.96]", "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent", "focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900")}>
        <span className="text-xl tracking-[0.25em]">{isRolling ? "Rolling…" : noMatches ? "No matches" : "Roll"}</span>
      </button>
    </motion.div>
  );
}
