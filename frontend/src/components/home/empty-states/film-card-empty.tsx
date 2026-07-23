"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EmptyStateShell } from "@/components/home/empty-states/empty-state-shell";
import { StandbyMarquee } from "@/components/home/empty-states/standby-marquee";

export function FilmCardEmpty() {
  const prefersReduced = useReducedMotion();
  return (
    <EmptyStateShell glowOpacity={0.12}>
      {/* Standby status — broadcast "on but untuned" */}
      <div className="flex items-center gap-2.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.4em] text-[#e8453c]/80">
        <motion.span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-[#e8453c]"
          animate={prefersReduced ? { opacity: 1 } : { opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity }}
        />
        Standby · CH 03
      </div>

      <div className="flex flex-col gap-0.5">
        <h2 className="font-[family-name:var(--font-display)] text-[2.4rem] font-bold leading-tight">
          <span className="block text-[#F5F5F0]">What&apos;s playing</span>
          <span className="block text-[#e8453c]">tonight?</span>
        </h2>
      </div>

      <p className="max-w-[19rem] font-[family-name:var(--font-geist-mono)] text-[11px] uppercase leading-relaxed tracking-[0.16em] text-[#888899]">
        One random pick from six decades of Oscar, Cannes &amp; Golden Globe winners.
      </p>

      <StandbyMarquee />

      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-[#888899]">
        Press{" "}
        <kbd className="mx-0.5 rounded border border-[#2a2a3e] bg-[#11111b] px-1.5 py-0.5 text-[11px] font-bold not-italic text-[#cfcfe0]">
          Space
        </kbd>{" "}
        or hit Roll to tune in
      </p>
    </EmptyStateShell>
  );
}
