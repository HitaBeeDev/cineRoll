"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Film, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Perforated film-strip edge used at the top and bottom of an empty state. */
function FilmStrip({ edge }: { edge: "top" | "bottom" }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-[5px] bg-[#060610] px-3 py-[7px] border-[#1a1a28]",
        edge === "top" ? "border-b" : "border-t",
      )}
    >
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="h-[10px] w-[7px] shrink-0 rounded-[2px] bg-[#111120]"
        />
      ))}
    </div>
  );
}

/** Shared empty-state scaffolding: scanline overlay, film-strip edges, and a
 *  centered main area with a radial glow. Callers supply the inner content and
 *  the glow intensity. */
function EmptyStateShell({
  glowOpacity = 0.08,
  children,
}: {
  glowOpacity?: number;
  children: React.ReactNode;
}) {
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

      <FilmStrip edge="top" />

      {/* Main area */}
      <div className="relative flex flex-1 flex-col items-center justify-center gap-5 px-8 py-10 text-center">
        {/* Radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(ellipse at center,rgba(232,69,60,${glowOpacity}) 0%,transparent 70%)`,
          }}
        />
        {children}
      </div>

      <FilmStrip edge="bottom" />
    </div>
  );
}

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
          <h3 className="font-[family-name:var(--font-display)] text-[2.4rem] font-bold leading-tight text-[#F5F5F0]">
            Nothing in
          </h3>
          <h3 className="font-[family-name:var(--font-display)] text-[2.4rem] font-bold leading-tight text-[#e8453c]">
            the reel.
          </h3>
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

// A teaser lineup for the idle "standby" ticker — iconic Oscar/Cannes/Globe
// winners, so the panel previews the kind of films in the reel before the
// first roll. Static + curated (no fetch) on purpose.
const STANDBY_LINEUP = [
  "Parasite",
  "The Godfather",
  "Casablanca",
  "Pulp Fiction",
  "Moonlight",
  "Apocalypse Now",
  "La Dolce Vita",
  "No Country for Old Men",
  "All About Eve",
  "In the Mood for Love",
  "Amour",
  "Nomadland",
];

/** Slow horizontal ticker of award-winner titles — the "tonight's lineup" feel.
 *  Loops seamlessly (two copies, translate −50%); static when reduced motion. */
function StandbyMarquee() {
  const prefersReduced = useReducedMotion();
  const fade =
    "linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)";

  const Row = ({ ariaHidden = false }: { ariaHidden?: boolean }) => (
    <div
      className="flex shrink-0 items-center gap-6 pr-6 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#9a9aad]"
      aria-hidden={ariaHidden || undefined}
    >
      {STANDBY_LINEUP.map((title) => (
        <span key={title} className="flex shrink-0 items-center gap-6 whitespace-nowrap">
          {title}
          <span className="text-[#D4AF37]/55">◆</span>
        </span>
      ))}
    </div>
  );

  if (prefersReduced) {
    return (
      <div
        className="w-full overflow-hidden"
        style={{ maskImage: fade, WebkitMaskImage: fade }}
      >
        <div className="flex justify-center">
          <Row />
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full overflow-hidden"
      style={{ maskImage: fade, WebkitMaskImage: fade }}
    >
      <motion.div
        className="flex w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, ease: "linear", repeat: Infinity }}
      >
        <Row />
        <Row ariaHidden />
      </motion.div>
    </div>
  );
}

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
        <h3 className="font-[family-name:var(--font-display)] text-[2.4rem] font-bold leading-tight text-[#F5F5F0]">
          What&apos;s playing
        </h3>
        <h3 className="font-[family-name:var(--font-display)] text-[2.4rem] font-bold leading-tight text-[#e8453c]">
          tonight?
        </h3>
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
