"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Film, X } from "lucide-react";
import { EmptyStateShell } from "@/components/home/empty-states/empty-state-shell";

export function ZeroResultsEmpty({
  onClear,
  onClearAndRoll,
}: {
  onClear: () => void;
  onClearAndRoll: () => void;
}) {
  const prefersReduced = useReducedMotion();
  const containerVariants = {
    hidden: {},
    show: {
      transition: { staggerChildren: prefersReduced ? 0 : 0.08 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: [0, 0, 0.58, 1] as [number, number, number, number] },
    },
  };

  return (
    <EmptyStateShell glowOpacity={0.08}>
      <motion.div
        className="flex flex-col items-center gap-5"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Icon — film reel with X */}
        <motion.div variants={itemVariants} className="relative">
          <Film
            className="h-16 w-16 text-[#e8453c]/15"
            strokeWidth={1}
            aria-hidden
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <X
              className="h-8 w-8 text-[#e8453c]/30"
              strokeWidth={1.5}
              aria-hidden
            />
          </div>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.4em] text-[#e8453c]/70"
        >
          ◈ No Matches ◈
        </motion.p>

        <motion.div variants={itemVariants} className="flex flex-col gap-0.5">
          <h2 className="font-[family-name:var(--font-display)] text-[2.4rem] font-bold leading-tight">
            <span className="block text-[#F5F5F0]">Nothing in</span>
            <span className="block text-[#e8453c]">the reel.</span>
          </h2>
        </motion.div>

        <motion.p
          variants={itemVariants}
          className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899]"
        >
          Your filters are very specific
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center gap-3 pt-1"
        >
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl bg-[#e8453c] px-6 py-2.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.2em] text-white transition-opacity hover:opacity-90"
          >
            Clear all filters
          </button>
          <button
            type="button"
            onClick={onClearAndRoll}
            className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899] underline-offset-4 transition-colors hover:text-[#F5F5F0] hover:underline"
          >
            or try a random film instead
          </button>
        </motion.div>
      </motion.div>
    </EmptyStateShell>
  );
}
