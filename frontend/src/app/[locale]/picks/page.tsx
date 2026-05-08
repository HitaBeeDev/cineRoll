"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Bookmark, RefreshCw, Share2, Star, Trophy, Clapperboard } from "lucide-react";
import { SiteNavigation } from "@/components/site-navigation";
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
          const parsed = JSON.parse(cached) as DailyPick[];
          setPicks(parsed);
          setIsLoading(false);
          return;
        }
      } catch {}
    }
    setIsRefreshing(true);
    const results = await Promise.allSettled(
      PICK_SLOTS.map(async (slot) => {
        const r = await fetchRandom(slot.filters);
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
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b border-[#1a1a28] bg-[#09090f] px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="font-[family-name:var(--font-geist-mono)] text-[1.1rem] font-bold uppercase tracking-[0.15em] text-[#e8453c]"
          >
            Cine·Roll
          </Link>
          <span className="hidden items-center rounded-full border border-[#e8453c]/25 px-2.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#e8453c]/55 sm:inline-flex">
            Daily Picks
          </span>
        </div>
        <SiteNavigation />
      </header>

      {/* Main */}
      <main className="flex flex-1 flex-col overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:w-0">
        {/* Page header */}
        <div className="border-b border-[#1a1a28] px-6 py-6 sm:px-10">
          <div className="flex items-end justify-between">
            <div>
              <p className="mb-1 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.3em] text-[#e8453c]/70">
                ◈ Three Films · One Day ◈
              </p>
              <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#F5F5F0] sm:text-4xl">
                Today&apos;s Picks
              </h1>
              <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest text-[#555568]">
                {dateLabel} · Refreshes at midnight
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadPicks(true)}
              disabled={isRefreshing}
              className={cn(
                "flex items-center gap-2 rounded-full border border-[#1e1e2a] px-4 py-2",
                "font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#555568]",
                "transition-colors hover:border-[#e8453c]/40 hover:text-[#F5F5F0]",
                "disabled:opacity-40",
              )}
            >
              <RefreshCw className={cn("h-3 w-3", isRefreshing && "motion-safe:animate-spin")} />
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
                layout={!shouldReduceMotion}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: shouldReduceMotion ? 0 : 0.15, ease: "easeIn" } }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" }}
                className="flex flex-1 items-center justify-center"
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-2 w-2 rounded-full bg-[#e8453c]/40 motion-safe:animate-pulse"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                  <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#444458]">
                    Curating today&apos;s selection…
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="picks"
                layout={!shouldReduceMotion}
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
      layout={!shouldReduceMotion}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : {
              delay: index * 0.1,
              type: "spring",
              stiffness: 300,
              damping: 28,
            }
      }
      className="group relative flex flex-1 flex-col overflow-hidden border-b border-[#1a1a28] lg:border-b-0 lg:border-r"
    >
      {/* Backdrop */}
      <div className="relative flex-1">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={film.title}
            fill
            sizes="(max-width: 1024px) 100vw, 33vw"
            className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105"
            priority={index === 0}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#09090f]" />
        )}
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090f] via-[#09090f]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090f]/20 to-transparent" />

        {/* Pick number + slot label */}
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span
            className="font-[family-name:var(--font-geist-mono)] text-[2rem] font-bold leading-none"
            style={{ color: `${slot.accentColor}30` }}
          >
            {slot.num}
          </span>
        </div>

        {/* Slot badge */}
        <div className="absolute right-4 top-4">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
              "font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-widest",
              slot.borderColor,
            )}
            style={{ color: slot.accentColor, backgroundColor: `${slot.accentColor}10` }}
          >
            {slot.icon}
            {slot.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-2 p-5">
        {/* Mood tag */}
        <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.3em]"
          style={{ color: slot.accentColor }}>
          {slot.mood}
        </span>

        {/* Title */}
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-tight text-[#F5F5F0] sm:text-3xl">
          {film.title}
        </h2>

        {/* Meta */}
        <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest text-[#888899]">
          {film.year}{runtime && ` · ${runtime}`}{genre && ` · ${genre}`}
        </p>

        {film.director && (
          <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#555568]">
            Dir. {film.director}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3">
          {film.imdbRating != null && (
            <span className="font-[family-name:var(--font-geist-mono)] text-[10px] font-bold text-[#F5F5F0]">
              IMDb {film.imdbRating.toFixed(1)}
            </span>
          )}
          {film.rtScore != null && (
            <span className="font-[family-name:var(--font-geist-mono)] text-[10px] font-bold text-[#F5F5F0]">
              RT {film.rtScore}%
            </span>
          )}
          {totalWins > 0 && (
            <span className="font-[family-name:var(--font-geist-mono)] text-[10px]"
              style={{ color: slot.accentColor }}>
              {totalWins}× Award Winner
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Link
            href={`/film/${film.slug}`}
            className={cn(
              "flex flex-1 items-center justify-center rounded-xl py-2.5",
              "font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-widest text-[#F5F5F0]",
              "transition-all duration-150 hover:brightness-110",
            )}
            style={{ backgroundColor: slot.accentColor }}
          >
            Watch Tonight
          </Link>
          <button
            type="button"
            aria-label="Add to watchlist"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1e1e2a] text-[#444458] transition-colors hover:border-[#2a2a3e] hover:text-[#F5F5F0]"
          >
            <Bookmark className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Share"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#1e1e2a] text-[#444458] transition-colors hover:border-[#2a2a3e] hover:text-[#F5F5F0]"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
