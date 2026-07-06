"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

type SuspectRevealBannerProps = {
  correct: boolean | null;
  answer: string;
  reduced: boolean;
};

export function SuspectRevealBanner({ correct, answer, reduced }: SuspectRevealBannerProps) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={[
        "mb-2 flex items-center justify-between gap-3 rounded-xl border px-3 py-2",
        correct ? "border-[#4ade80]/45 bg-[#4ade80]/10 text-[#bbf7d0]" : "border-[#e8453c]/45 bg-[#e8453c]/10 text-[#fecaca]",
      ].join(" ")}
    >
      <div className="flex min-w-0 items-center gap-2">
        {correct ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-[#4ade80]" />
        ) : (
          <XCircle className="h-4 w-4 shrink-0 text-[#e8453c]" />
        )}
        <p className="truncate font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.18em]">
          {correct ? "Correct pick" : "Case missed"}
        </p>
      </div>
      <p className="hidden text-xs text-[#d4d4df] sm:block">
        {correct ? "You cracked the hidden film." : `Answer: ${answer}`}
      </p>
    </motion.div>
  );
}
