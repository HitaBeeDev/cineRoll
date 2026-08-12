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

  // While a filtered count is in flight the pool is genuinely unknown, so the
  // remark is withheld rather than replaced with a placeholder sentence. The
  // "···" already standing in for the number is the loading signal; a second one
  // in words only gives the line something else to swap out of.
  const { noun, comment } = getCountTagline(effectiveCountLoading ? null : displayCount);
  return (
    <div className="flex min-w-0 shrink-0 flex-col items-start gap-0.5">
      <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899]">Reel Pool</span>
      <AnimatedPoolCount value={poolCountLabel} />
      {/* One line, two lifetimes: the noun is plain text so it never animates,
          and only the remark after it is keyed into AnimatePresence. */}
      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-wide text-[#9090a8]">
        {noun}.{" "}
        <AnimatePresence mode="wait" initial={false}>
          {comment && (
            <motion.span key={comment} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>{comment}</motion.span>
          )}
        </AnimatePresence>
      </p>
      <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899]">Press [Space] to spin</span>
    </div>
  );
}
