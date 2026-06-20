"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Dices, Film, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="relative flex h-full flex-1 flex-col overflow-hidden">
      {/* Scanlines */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,#F5F5F0,#F5F5F0 1px,transparent 1px,transparent 3px)",
        }}
      />

      {/* Film strip — top */}
      <div className="flex shrink-0 items-center gap-[5px] border-b border-[#1a1a28] bg-[#060610] px-3 py-[7px]">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="h-[10px] w-[7px] shrink-0 rounded-[2px] bg-[#111120]"
          />
        ))}
      </div>

      {/* Main area */}
      <div className="relative flex flex-1 flex-col items-center justify-center gap-5 px-8 py-10 text-center">
        {/* Radial glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,69,60,0.08)_0%,transparent_70%)]" />

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
            className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.4em] text-[#e8453c]/70"
          >
            ◈ No Matches ◈
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col gap-0.5">
            <h3 className="font-[family-name:var(--font-display)] text-[2.4rem] font-bold leading-tight text-[#F5F5F0]">
              Nothing in
            </h3>
            <h3 className="font-[family-name:var(--font-display)] text-[2.4rem] font-bold leading-tight text-[#e8453c]">
              the reel.
            </h3>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest text-[#888899]"
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
              className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest text-[#888899] underline-offset-4 transition-colors hover:text-[#F5F5F0] hover:underline"
            >
              or try a random film instead
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Film strip — bottom */}
      <div className="flex shrink-0 items-center gap-[5px] border-t border-[#1a1a28] bg-[#060610] px-3 py-[7px]">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="h-[10px] w-[7px] shrink-0 rounded-[2px] bg-[#111120]"
          />
        ))}
      </div>
    </div>
  );
}

export function FilmCardEmpty() {
  return (
    <div className="relative flex h-full flex-1 flex-col overflow-hidden">
      {/* Scanlines */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.025]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg,#F5F5F0,#F5F5F0 1px,transparent 1px,transparent 3px)",
        }}
      />

      {/* Film strip — top */}
      <div className="flex shrink-0 items-center gap-[5px] border-b border-[#1a1a28] bg-[#060610] px-3 py-[7px]">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="h-[10px] w-[7px] shrink-0 rounded-[2px] bg-[#111120]"
          />
        ))}
      </div>

      {/* Main area */}
      <div className="relative flex flex-1 flex-col items-center justify-center gap-5 px-8 py-10 text-center">
        {/* Radial glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(232,69,60,0.12)_0%,transparent_70%)]" />

        <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.4em] text-[#e8453c]/70">
          ◈ Reel Ready ◈
        </p>

        <div className="flex flex-col gap-0.5">
          <h3 className="font-[family-name:var(--font-display)] text-[2.4rem] font-bold leading-tight text-[#F5F5F0]">
            What&apos;s playing
          </h3>
          <h3 className="font-[family-name:var(--font-display)] text-[2.4rem] font-bold leading-tight text-[#e8453c]">
            tonight?
          </h3>
        </div>

        <div className="flex w-full items-center gap-3 px-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#2a2a3e]" />
          <Dices className="h-4 w-4 text-[#e8453c]/50" aria-hidden />
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#2a2a3e]" />
        </div>

        <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest text-[#888899]">
          Hit Roll or press Space to find out
        </p>

        <div className="flex gap-2">
          {["Oscar", "Cannes", "Golden Globe"].map((award) => (
            <span
              key={award}
              className="rounded-full border border-[#2a2a3e] px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-widest text-[#888899]"
            >
              {award}
            </span>
          ))}
        </div>
      </div>

      {/* Film strip — bottom */}
      <div className="flex shrink-0 items-center gap-[5px] border-t border-[#1a1a28] bg-[#060610] px-3 py-[7px]">
        {Array.from({ length: 16 }).map((_, i) => (
          <div
            key={i}
            className="h-[10px] w-[7px] shrink-0 rounded-[2px] bg-[#111120]"
          />
        ))}
      </div>
    </div>
  );
}

export function FilmCardSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="px-4 pb-2 pt-4">
        <Skeleton className="h-5 w-32 rounded-full bg-[#111120]" />
      </div>
      <div className="w-full bg-[#0d0d1a]" style={{ aspectRatio: "16/9" }} />
      <div className="flex flex-col gap-4 p-5">
        <Skeleton className="h-3 w-40 rounded bg-[#111120]" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-3/4 rounded bg-[#111120]" />
          <Skeleton className="h-6 w-1/2 rounded bg-[#111120]" />
        </div>
        <Skeleton className="h-3 w-36 rounded bg-[#111120]" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-full rounded bg-[#111120]" />
          <Skeleton className="h-3 w-5/6 rounded bg-[#111120]" />
          <Skeleton className="h-3 w-2/3 rounded bg-[#111120]" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-14 rounded-lg bg-[#111120]" />
          <Skeleton className="h-14 rounded-lg bg-[#111120]" />
          <Skeleton className="h-14 rounded-lg bg-[#111120]" />
        </div>
        <Skeleton className="h-11 rounded-xl bg-[#111120]" />
      </div>
    </div>
  );
}
