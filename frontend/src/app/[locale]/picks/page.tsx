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
  filters: Partial<FilterState>;
}[] = [
  {
    num: "01",
    label: "Award Prestige",
    mood: "Moving & Acclaimed",
    icon: <Trophy className="h-3 w-3" />,
    accentColor: "#e8453c",
    filters: { awardBody: "oscar", winnerOnly: true, imdbRatingMin: 7.5 },
  },
  {
    num: "02",
    label: "World Cinema",
    mood: "Daring & Original",
    icon: <Clapperboard className="h-3 w-3" />,
    accentColor: "#4a9eff",
    filters: { awardBody: "cannes", winnerOnly: true },
  },
  {
    num: "03",
    label: "Hidden Gem",
    mood: "Surprising & Rare",
    icon: <Star className="h-3 w-3" />,
    accentColor: "#a78bfa",
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
    <div className="flex h-screen flex-col overflow-hidden bg-[#080810] text-[#F5F5F0]">
      <AppHeader />

      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Page header */}
        <div className="flex items-center justify-between border-b border-white/[0.05] px-6 py-4 sm:px-10">
          <div className="flex items-center gap-5">
            {/* Decorative accent bars */}
            <div className="flex flex-col gap-[3px] shrink-0">
              <div className="h-[2px] w-7 bg-[#e8453c]" />
              <div className="h-[2px] w-4 bg-[#e8453c]/35" />
            </div>

            <div>
              <p className="mb-0.5 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.35em] text-[#e8453c]/60">
                Three Films · One Evening
              </p>
              <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-none text-[#F5F5F0]">
                Today&apos;s Picks
              </h1>
            </div>

            <div className="hidden h-7 w-px bg-white/[0.07] sm:block" />
            <p className="hidden font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#30304a] sm:block">
              {dateLabel}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadPicks(true)}
            disabled={isRefreshing}
            className={cn(
              "group flex items-center gap-2 rounded-full border border-white/10 px-4 py-2",
              "font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#3d3d58]",
              "transition-all duration-200 hover:border-[#e8453c]/40 hover:text-[#F5F5F0]",
              "disabled:pointer-events-none disabled:opacity-30",
            )}
          >
            <RefreshCw
              className={cn(
                "h-3 w-3 transition-transform duration-500",
                isRefreshing ? "animate-spin" : "group-hover:rotate-[180deg]",
              )}
            />
            Reshuffle
          </button>
        </div>

        {/* Cards */}
        <div className="flex flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: shouldReduceMotion ? 0 : 0.15 } }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                className="flex flex-1 flex-col items-center justify-center gap-5"
              >
                <div className="flex gap-2">
                  {(["#e8453c", "#4a9eff", "#a78bfa"] as const).map((color, i) => (
                    <motion.div
                      key={color}
                      className="h-[3px] w-10 rounded-full"
                      style={{ backgroundColor: color }}
                      animate={{ opacity: [0.2, 0.8, 0.2] }}
                      transition={{
                        duration: 1.4,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
                <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.3em] text-[#2e2e46]">
                  Curating today&apos;s selection
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="picks"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: shouldReduceMotion ? 0 : 0.15 } }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.25 }}
                className="flex flex-1 flex-col overflow-hidden lg:flex-row"
              >
                {/* Featured pick — 62% on desktop */}
                {picks[0] && (
                  <div className="flex min-h-[45vh] flex-1 lg:min-h-0 lg:w-[62%] lg:flex-none">
                    <PickCard pick={picks[0]} index={0} featured />
                  </div>
                )}

                {/* Secondary picks — 38% on desktop, stacked */}
                <div className="flex flex-1 flex-col border-t border-white/[0.05] lg:w-[38%] lg:flex-none lg:border-l lg:border-t-0">
                  {picks[1] && (
                    <div className="flex flex-1">
                      <PickCard pick={picks[1]} index={1} />
                    </div>
                  )}
                  {picks[2] && (
                    <div className="flex flex-1 border-t border-white/[0.05]">
                      <PickCard pick={picks[2]} index={2} />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function PickCard({
  pick,
  index,
  featured = false,
}: {
  pick: DailyPick;
  index: number;
  featured?: boolean;
}) {
  const shouldReduceMotion = useReducedMotion();
  const { film, slot } = pick;
  const imageUrl = film.backdropUrl ?? film.posterUrl;
  const genre = film.genres[0] ?? "";
  const runtime = formatRuntime(film.runtime);
  const totalWins = film.oscarWins + film.ggWins + film.cannesWins;

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { delay: index * 0.07, type: "spring", stiffness: 300, damping: 28 }
      }
      className="group relative flex flex-1 overflow-hidden"
    >
      {/* Top accent strip */}
      <div
        className="absolute inset-x-0 top-0 z-20 h-[2px]"
        style={{ backgroundColor: slot.accentColor }}
      />

      {/* Image */}
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={film.title}
          fill
          sizes={
            featured ? "(max-width: 1024px) 100vw, 62vw" : "(max-width: 1024px) 100vw, 38vw"
          }
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          priority={index === 0}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#16162a] to-[#080810]" />
      )}

      {/* Gradient overlay — softer, more image shows */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#080810] via-[#080810]/25 to-transparent" />

      {/* Ghost slot number — decorative */}
      <div className="pointer-events-none absolute right-3 top-2 select-none leading-none">
        <span
          className="font-[family-name:var(--font-display)] font-black leading-none"
          style={{
            fontSize: featured ? "9rem" : "6rem",
            color: `${slot.accentColor}0f`,
            lineHeight: 1,
          }}
        >
          {slot.num}
        </span>
      </div>

      {/* Slot badge — top left */}
      <div className="absolute left-4 top-5 z-10">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[5px] font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-widest backdrop-blur-sm"
          style={{
            color: slot.accentColor,
            borderColor: `${slot.accentColor}35`,
            backgroundColor: `${slot.accentColor}12`,
          }}
        >
          {slot.icon}
          {slot.label}
        </span>
      </div>

      {/* Content */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 z-10 flex flex-col",
          featured ? "gap-2.5 p-6 lg:p-8" : "gap-2 p-5",
        )}
      >
        {/* Mood */}
        <p
          className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.3em]"
          style={{ color: `${slot.accentColor}b3` }}
        >
          {slot.mood}
        </p>

        {/* Title */}
        <h2
          className={cn(
            "font-[family-name:var(--font-display)] font-bold leading-[1.1] text-[#F5F5F0]",
            featured ? "text-3xl lg:text-[2.6rem]" : "text-xl lg:text-2xl",
          )}
        >
          {film.title}
        </h2>

        {/* Meta */}
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

        {/* Scores */}
        <div className="flex items-center gap-3">
          {film.imdbRating != null && (
            <span className="font-[family-name:var(--font-geist-mono)] text-[10px] font-bold text-[#c8c8d8]">
              ★ {film.imdbRating.toFixed(1)}
            </span>
          )}
          {film.rtScore != null && (
            <span className="font-[family-name:var(--font-geist-mono)] text-[10px] font-bold text-[#c8c8d8]">
              RT {film.rtScore}%
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

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Link
            href={`/film/${film.slug}`}
            className="group/btn flex flex-1 items-center justify-between rounded-xl px-4 py-2.5 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-widest text-[#F5F5F0] transition-all duration-150 hover:brightness-110"
            style={{ backgroundColor: slot.accentColor }}
          >
            <span>Watch Tonight</span>
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </Link>
          <button
            type="button"
            aria-label="Add to watchlist"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-[#3d3d58] transition-colors hover:border-white/20 hover:text-[#F5F5F0]"
          >
            <Bookmark className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Share"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-[#3d3d58] transition-colors hover:border-white/20 hover:text-[#F5F5F0]"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
