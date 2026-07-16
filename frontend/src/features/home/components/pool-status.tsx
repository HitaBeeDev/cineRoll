"use client";

import { AnimatePresence, motion } from "framer-motion";
import { getCountTagline } from "../get-count-tagline";
import type { PoolStatusProps } from "../component-props";
import { AnimatedPoolCount } from "./animated-pool-count";

export function PoolStatus({ displayCount, effectiveCount, effectiveCountLoading, poolCountLabel }: PoolStatusProps) {
  if (effectiveCount === 0) {
    return (
      <div className="flex min-w-0 shrink-0 flex-col items-start gap-0.5">
        <p className="max-w-full font-[family-name:var(--font-geist-mono)] text-[11px] leading-relaxed tracking-wide text-[#9090a8] sm:max-w-[180px]">No films match —<br />even we couldn&apos;t find that.<br />Try relaxing a filter.</p>
      </div>
    );
  }

  const tagline = effectiveCountLoading ? "finding films…" : getCountTagline(displayCount);
  return (
    <div className="flex min-w-0 shrink-0 flex-col items-start gap-0.5">
      <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899]">Reel Pool</span>
      <AnimatedPoolCount value={poolCountLabel} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={tagline} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-wide text-[#9090a8]">{tagline}</motion.span>
      </AnimatePresence>
      <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899]">Press [Space] to spin</span>
    </div>
  );
}
