"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EmptyStateShell } from "@/components/home/empty-states/empty-state-shell";
import { StandbyMarquee } from "@/components/home/empty-states/standby-marquee";

export function FilmCardEmpty() {
  const prefersReduced = useReducedMotion();
  return (
    <EmptyStateShell glowOpacity={0.12}>
      {/* Standby status — broadcast "on but untuned" */}
      <div className="flex items-center gap-2.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.4em] text-accent/80">
        <motion.span
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-accent"
          animate={prefersReduced ? { opacity: 1 } : { opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity }}
        />
        Standby · CH 03
      </div>

      <div className="flex flex-col gap-0.5">
        <h2 className="font-[family-name:var(--font-display)] text-[2.4rem] font-bold leading-tight">
          <span className="block text-fg-hi">What&apos;s playing</span>
          <span className="block text-accent">tonight?</span>
        </h2>
      </div>

      {/* The one sentence that says what the product does, so it is set at
          reading size rather than at the size of the standby furniture around
          it. Everything else in this panel is chrome you skim once. */}
      <p className="max-w-[19rem] font-[family-name:var(--font-geist-mono)] text-[12px] uppercase leading-relaxed tracking-[0.16em] text-[#888899]">
        One random pick from six decades of Oscar, Cannes &amp; Golden Globe winners.
      </p>

      <StandbyMarquee />

      {/* Keyboard-only hint — hidden where there is no keyboard to offer it to.
          Roll itself is a button on every device; this line just names the
          shortcut that sits beside it. */}
      <p className="hidden font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-[#888899] [@media(hover:hover)_and_(pointer:fine)]:block">
        Press{" "}
        <kbd className="mx-0.5 rounded border border-edge-strong bg-ink-800 px-1.5 py-0.5 text-[11px] font-bold not-italic text-[#cfcfe0]">
          Space
        </kbd>{" "}
        or hit Roll to tune in
      </p>
    </EmptyStateShell>
  );
}
