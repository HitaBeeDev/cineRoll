"use client";

import { motion } from "framer-motion";

type CaseCrackedBannerProps = {
  reduced: boolean;
};

export function CaseCrackedBanner({ reduced }: CaseCrackedBannerProps) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="relative overflow-hidden rounded-xl border border-[#4ade80]/45 bg-[#4ade80]/10 px-4 py-3 text-center shadow-[0_0_40px_rgba(74,222,128,0.12)]"
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-[#bbf7d0]/70" />
      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.22em] text-[#4ade80]">
        Case cracked
      </p>
      <p className="mt-1 text-sm text-[#d4d4df]">Perfect read. You found the hidden film.</p>
    </motion.div>
  );
}
