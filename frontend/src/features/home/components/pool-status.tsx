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

  // "The Archive", not "Reel Pool": the number below states how many films the
  // catalogue holds for these filters — the same figure browse and stats report —
  // while the roll draws from a narrower, quality-gated set. Under the old label
  // that gap read as a broken promise, because "reel pool" names the thing you
  // are about to draw from. Naming the collection instead makes the figure true,
  // and lets one number stand for the product's size everywhere it appears.
  //
  // While a filtered count is in flight the size is genuinely unknown, so the
  // remark is withheld rather than replaced with a placeholder sentence. The
  // "···" already standing in for the number is the loading signal; a second one
  // in words only gives the line something else to swap out of.
  const { noun, comment } = getCountTagline(effectiveCountLoading ? null : displayCount);
  return (
    <div className="flex min-w-0 shrink-0 flex-col items-start gap-0.5">
      <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#888899]">The Archive</span>
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
