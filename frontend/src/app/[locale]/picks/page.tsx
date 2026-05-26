"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Bookmark, RefreshCw, Share2, Star, Trophy, Clapperboard, ArrowUpRight } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { fetchRandom, type RollFilm } from "@/lib/api";
import { formatRuntime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FilterState } from "@cineroll/types";

const PICK_SLOTS: {
  num: string;
  label: string;
  mood: string;
  icon: React.ReactNode;
  accentColor: string;
  borderColor: string;
  filters: Partial<FilterState>;
}[] = [
  {
    num: "01",
    label: "Award Prestige",
    mood: "Moving & Acclaimed",
    icon: <Trophy className="h-3.5 w-3.5" />,
    accentColor: "#e8453c",
    borderColor: "border-[#e8453c]/30",
    filters: { awardBody: "oscar", winnerOnly: true, imdbRatingMin: 7.5 },
  },
  {
    num: "02",
    label: "World Cinema",
    mood: "Daring & Original",
    icon: <Clapperboard className="h-3.5 w-3.5" />,
    accentColor: "#4a9eff",
    borderColor: "border-[#4a9eff]/30",
    filters: { awardBody: "cannes", winnerOnly: true },
  },
  {
    num: "03",
    label: "Hidden Gem",
    mood: "Surprising & Rare",
    icon: <Star className="h-3.5 w-3.5" />,
    accentColor: "#a78bfa",
    borderColor: "border-[#a78bfa]/30",
    filters: { imdbRatingMin: 7.5, decadeMin: 1960, decadeMax: 2005 },
  },
];

type DailyPick = { film: RollFilm; slot: (typeof PICK_SLOTS)[number] };

function todayKey() {
  return `cinepicks-${new Date().toISOString().split("T")[0] ?? ""}`;
}

export default function PicksPage() {
  const shouldReduceMotion = useReducedMotion();
  const [picks, setPicks] = useState<DailyPick[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadPicks = useCallback(async (force = false) => {
    const key = todayKey();
    if (!force) {
      try {
        const cached = localStorage.getItem(key);
        if (cached) {
          const parsed = JSON.parse(cached) as Array<{ film: RollFilm; slot: { num: string } }>;
          const restored = parsed
            .map(({ film, slot }) => {
              const fullSlot = PICK_SLOTS.find((s) => s.num === slot.num);
              if (!fullSlot) return null;
              return { film, slot: fullSlot };
            })
            .filter((p): p is DailyPick => p !== null);
          setPicks(restored);
          setIsLoading(false);
          return;
        }
      } catch {}
    }
    setIsRefreshing(true);
    const results = await Promise.allSettled(
      PICK_SLOTS.map(async (slot) => {
        const r = await fetchRandom();
        return { film: r.film, slot };
      }),
    );
    const newPicks: DailyPick[] = results
      .filter((r): r is PromiseFulfilledResult<DailyPick> => r.status === "fulfilled")
      .map((r) => r.value);
    try {
      localStorage.setItem(key, JSON.stringify(newPicks));
    } catch {}
    setPicks(newPicks);
    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => void loadPicks(), 0);
    return () => window.clearTimeout(id);
  }, [loadPicks]);

  const dateLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#09090f] text-[#F5F5F0]">
      <AppHeader />

      <main className="flex flex-1 flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:w-0">
        {/* Page header */}
        <div className="border-b border-[#1a1a28] px-6 py-5 sm:px-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-[3px]">
                <div className="h-[2px] w-6 bg-[#e8453c]" />
                <div className="h-[2px] w-3.5 bg-[#e8453c]/35" />
              </div>
              <div>
                <p className="mb-0.5 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.35em] text-[#e8453c]/60">
                  Three Films · One Evening
                </p>
                <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-none text-[#F5F5F0] sm:text-3xl">
                  Today&apos;s Picks
                </h1>
              </div>
              <div className="hidden h-7 w-px bg-white/[0.07] sm:block" />
              <p className="hidden font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#2e2e46] sm:block">
                {dateLabel}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadPicks(true)}
              disabled={isRefreshing}
              className={cn(
                "group flex items-center gap-2 rounded-full border border-[#1e1e2a] px-4 py-2",
                "font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#444458]",
                "transition-all duration-200 hover:border-[#e8453c]/40 hover:text-[#F5F5F0]",
                "disabled:pointer-events-none disabled:opacity-30",
              )}
            >
              <RefreshCw
                className={cn(
                  "h-3 w-3 transition-transform duration-500",
                  isRefreshing ? "animate-spin" : "group-hover:rotate-180",
                )}
              />
              Reshuffle
            </button>
          </div>
        </div>

        {/* Cards grid */}
        <div className="flex flex-1 flex-col lg:flex-row">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: shouldReduceMotion ? 0 : 0.15, ease: "easeIn" } }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" }}
                className="flex flex-1 items-center justify-center"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="flex gap-2">
                    {(["#e8453c", "#4a9eff", "#a78bfa"] as const).map((color, i) => (
                      <motion.div
                        key={color}
                        className="h-[3px] w-8 rounded-full"
                        style={{ backgroundColor: color }}
                        animate={shouldReduceMotion ? {} : { opacity: [0.2, 0.9, 0.2] }}
                        transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                      />
                    ))}
                  </div>
                  <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.3em] text-[#2e2e46]">
                    Curating today&apos;s selection
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="picks"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: shouldReduceMotion ? 0 : 0.15, ease: "easeIn" } }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: "easeOut" }}
                className="flex flex-1 flex-col lg:flex-row"
              >
                {picks.map((pick, i) => (
                  <PickCard key={pick.film.id} pick={pick} index={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function PickCard({ pick, index }: { pick: DailyPick; index: number }) {
  const shouldReduceMotion = useReducedMotion();
  const { film, slot } = pick;
  const imageUrl = film.backdropUrl ?? film.posterUrl;
  const genre = film.genres[0] ?? "";
  const runtime = formatRuntime(film.runtime);
  const totalWins = film.oscarWins + film.ggWins + film.cannesWins;

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { delay: index * 0.1, type: "spring", stiffness: 300, damping: 28 }
      }
      className="group relative flex flex-1 flex-col overflow-hidden border-b border-[#1a1a28] lg:border-b-0 lg:border-r last:border-r-0"
    >
      {/* Top accent strip */}
      <div
        className="absolute inset-x-0 top-0 z-20 h-[2px]"
        style={{ backgroundColor: slot.accentColor }}
      />

      {/* Backdrop */}
      <div className="relative flex-1">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={film.title}
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            priority={index === 0}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#09090f]" />
        )}

        {/* Gradient — softer so the image breathes */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090f] via-[#09090f]/20 to-transparent" />

        {/* Ghost slot number */}
        <div className="pointer-events-none absolute right-3 top-4 select-none">
          <span
            className="font-[family-name:var(--font-display)] font-black leading-none"
            style={{ fontSize: "7rem", color: `${slot.accentColor}12`, lineHeight: 1 }}
          >
            {slot.num}
          </span>
        </div>

        {/* Slot badge */}
        <div className="absolute left-4 top-5 z-10">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[5px]",
              "font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-widest backdrop-blur-sm",
              slot.borderColor,
            )}
            style={{ color: slot.accentColor, backgroundColor: `${slot.accentColor}12` }}
          >
            {slot.icon}
            {slot.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col gap-2 p-5">
        <span
          className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.3em]"
          style={{ color: `${slot.accentColor}b3` }}
        >
          {slot.mood}
        </span>

        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-[1.1] text-[#F5F5F0] sm:text-3xl">
          {film.title}
        </h2>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-wider text-[#555570]">
            {film.year}
          </span>
          {runtime && (
            <>
              <span className="text-[#252538]">·</span>
              <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-wider text-[#555570]">
                {runtime}
              </span>
            </>
          )}
          {genre && (
            <>
              <span className="text-[#252538]">·</span>
              <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-wider text-[#555570]">
                {genre}
              </span>
            </>
          )}
        </div>

        {film.director && (
          <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-wider text-[#3a3a56]">
            Dir. {film.director}
          </p>
        )}

        <div className="flex items-center gap-3">
          {film.imdbRating != null && (
            <span className="font-[family-name:var(--font-geist-mono)] text-[10px] font-bold text-[#c8c8d8]">
              ★ {film.imdbRating.toFixed(1)}
            </span>
          )}
          {film.rtScore != null ? (
            <span className="font-[family-name:var(--font-geist-mono)] text-[10px] font-bold text-[#c8c8d8]">
              RT {film.rtScore}%
            </span>
          ) : (
            <span className="font-[family-name:var(--font-geist-mono)] text-[10px] font-bold text-[#c8c8d8]/40">
              No RT Score
            </span>
          )}
          {totalWins > 0 && (
            <span
              className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-wide"
              style={{ color: slot.accentColor }}
            >
              {totalWins}× Winner
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Link
            href={`/film/${film.slug}`}
            className={cn(
              "group/btn flex flex-1 items-center justify-between rounded-xl px-4 py-2.5",
              "font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-widest text-[#F5F5F0]",
              "transition-all duration-150 hover:brightness-110",
            )}
            style={{ backgroundColor: slot.accentColor }}
          >
            <span>Watch Tonight</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </Link>
          <button
            type="button"
            aria-label="Add to watchlist"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#1e1e2a] text-[#3d3d58] transition-colors hover:border-[#2a2a3e] hover:text-[#F5F5F0]"
          >
            <Bookmark className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Share"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#1e1e2a] text-[#3d3d58] transition-colors hover:border-[#2a2a3e] hover:text-[#F5F5F0]"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
