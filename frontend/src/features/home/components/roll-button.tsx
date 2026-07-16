"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { RollButtonProps } from "../component-props";

export function RollButton({ disabled, effectiveCount, effectiveCountLoading, hasActiveFilters, isRolling, shouldPulse, onRoll }: RollButtonProps) {
  const noMatches = hasActiveFilters && effectiveCount === 0;
  const label = isRolling
    ? "Rolling…"
    : noMatches
      ? "No matches"
      : hasActiveFilters && effectiveCount !== null && !effectiveCountLoading
        ? `Roll from ${effectiveCount} films`
        : "Roll for a random film";

  return (
    <motion.div className="w-full shrink-0 rounded-2xl border-2 border-dashed border-[#e8453c]/30 p-1.5 sm:w-[185px]" animate={shouldPulse ? { boxShadow: ["0 0 0px rgba(232,69,60,0)", "0 0 28px rgba(232,69,60,0.42)", "0 0 0px rgba(232,69,60,0)"] } : { boxShadow: "0 0 0px rgba(232,69,60,0)" }} transition={shouldPulse ? { duration: 2.5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.5 }}>
      <button onClick={onRoll} disabled={disabled} aria-label={label} className={cn("flex h-[64px] w-full items-center justify-center rounded-xl", "bg-[#e8453c] text-[#09090f]", "font-[family-name:var(--font-geist-mono)] font-bold uppercase", "select-none transition-all duration-150", "hover:bg-[#d5342b] hover:shadow-[0_0_40px_rgba(232,69,60,0.28)]", "active:scale-[0.98]", "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]", "focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]")}>
        <span className="text-xl tracking-[0.25em]">{isRolling ? "Rolling…" : noMatches ? "No matches" : "Roll"}</span>
      </button>
    </motion.div>
  );
}
