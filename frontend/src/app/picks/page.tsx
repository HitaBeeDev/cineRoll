"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Bookmark, Share2, Star, Trophy, Clapperboard, ArrowUpRight } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { fetchSeededRandom, type RollFilm } from "@/lib/api";
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
    filters: { awardBodies: ["oscar"], winnerOnly: true, imdbRatingMin: 7.5 },
  },
  {
    num: "02",
    label: "World Cinema",
    mood: "Daring & Original",
    icon: <Clapperboard className="h-3.5 w-3.5" />,
    accentColor: "#4a9eff",
    borderColor: "border-[#4a9eff]/30",
    filters: { awardBodies: ["cannes"], winnerOnly: true },
  },
  {
    num: "03",
    label: "Hidden Gem",
    mood: "Acclaimed & Overlooked",
    icon: <Star className="h-3.5 w-3.5" />,
    accentColor: "#a78bfa",
    borderColor: "border-[#a78bfa]/30",
    // Genuinely obscure, not just well-rated: highly rated, but outside the
    // IMDb Top 250 and with no major award win — acclaimed films that flew
    // under the radar rather than canonical hits.
    filters: { imdbRatingMin: 7.5, imdbTopExclude: true, winsMax: 0 },
  },
];

type DailyPick = { film: RollFilm; slot: (typeof PICK_SLOTS)[number] };

// How many deterministic seed variants to try per slot while hunting for a
// decade/genre-diverse pick before settling for the seeded first choice.
const SEED_VARIANTS = 3;

function decadeOf(year: number): number {
  return Math.floor(year / 10) * 10;
}

/**
 * Resolve one slot's film. `excludeIds` (the films already chosen) guarantees no
 * duplicate across slots, so the first successful fetch is always a valid
 * fallback. Beyond that we try a few deterministic seed variants — each
 * excluding the candidates already seen so they differ — and return the first
 * whose decade and primary genre aren't already represented. If the curated
 * pool can't offer a diverse one, we keep the seeded first choice.
 */
async function selectPick(
  slot: (typeof PICK_SLOTS)[number],
  day: string,
  usedIds: string[],
  usedDecades: Set<number>,
  usedGenres: Set<string>,
): Promise<DailyPick | null> {
  let fallback: DailyPick | null = null;
  const seen: string[] = [];

  for (let v = 0; v < SEED_VARIANTS; v++) {
    const seed = v === 0 ? `${day}:${slot.num}` : `${day}:${slot.num}:v${v}`;
    let film: RollFilm;
    try {
      ({ film } = await fetchSeededRandom(seed, slot.filters, [...usedIds, ...seen]));
    } catch {
      // Pool exhausted for this slot (or a transient error) — try the next seed.
      continue;
    }

    const pick: DailyPick = { film, slot };
    if (!fallback) fallback = pick;
    seen.push(film.id);

    const genre = film.genres[0];
    const decadeClash = usedDecades.has(decadeOf(film.year));
    const genreClash = genre != null && usedGenres.has(genre);
    if (!decadeClash && !genreClash) return pick;
  }

  return fallback;
}

export default function PicksPage() {
  const shouldReduceMotion = useReducedMotion();
  const [picks, setPicks] = useState<DailyPick[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPicks = useCallback(async () => {
    // UTC day, matching the backend's pick-of-day convention. The selection is
    // deterministic from this key, so every visitor sees the same three films
    // today and they roll over together at UTC midnight.
    const day = new Date().toISOString().split("T")[0] ?? "";
    const key = `cinepicks-${day}`;

    // Same-day revisits restore instantly. Because selection is now
    // deterministic per day, this cache can never disagree with a fresh
    // fetch — it only saves the round-trips and the loader flash.
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached) as Array<{ film: RollFilm; slot: { num: string } }>;
        const restored = parsed
          .map(({ film, slot }) => {
            const fullSlot = PICK_SLOTS.find((s) => s.num === slot.num);
            return fullSlot ? { film, slot: fullSlot } : null;
          })
          .filter((p): p is DailyPick => p !== null);
        if (restored.length > 0) {
          setPicks(restored);
          setIsLoading(false);
          return;
        }
      }
    } catch {}

    // Pick slots in order, each excluding the films already chosen so the same
    // title can never fill two slots. The per-day+slot seed keeps each choice
    // deterministic; the diversity nudge inside selectPick spreads the picks
    // across decades and genres where the curated pools allow it.
    const newPicks: DailyPick[] = [];
    const usedIds: string[] = [];
    const usedDecades = new Set<number>();
    const usedGenres = new Set<string>();
    for (const slot of PICK_SLOTS) {
      const pick = await selectPick(slot, day, usedIds, usedDecades, usedGenres);
      if (!pick) continue;
      newPicks.push(pick);
      usedIds.push(pick.film.id);
      usedDecades.add(decadeOf(pick.film.year));
      const primaryGenre = pick.film.genres[0];
      if (primaryGenre) usedGenres.add(primaryGenre);
    }
    try {
      localStorage.setItem(key, JSON.stringify(newPicks));
    } catch {}
    setPicks(newPicks);
    setIsLoading(false);
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
                <p className="mb-0.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.35em] text-[#e8453c]/60">
                  Three Films · One Evening
                </p>
                <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold leading-none text-[#F5F5F0] sm:text-3xl">
                  Today&apos;s Picks
                </h1>
              </div>
              <div className="hidden h-7 w-px bg-white/[0.07] sm:block" />
              <p className="hidden font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-widest text-[#2e2e46] sm:block">
                {dateLabel}
              </p>
            </div>
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
                  <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.3em] text-[#2e2e46]">
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
                {/* Clear hierarchy: the first slot is the hero (larger, bolder,
                    the only fully-coloured CTA), the rest are quieter supporting
                    cards stacked beside it — so one pick leads the eye instead of
                    three competing equally. */}
                {picks[0] && (
                  <PickCard key={picks[0].film.id} pick={picks[0]} index={0} variant="hero" />
                )}
                {picks.length > 1 && (
                  <div className="flex flex-1 flex-col">
                    {picks.slice(1).map((pick, i) => (
                      <PickCard
                        key={pick.film.id}
                        pick={pick}
                        index={i + 1}
                        variant="supporting"
                      />
                    ))}
                  </div>
                )}
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
  variant,
}: {
  pick: DailyPick;
  index: number;
  variant: "hero" | "supporting";
}) {
  const shouldReduceMotion = useReducedMotion();
  const { film, slot } = pick;
  const imageUrl = film.backdropUrl ?? film.posterUrl;
  const genre = film.genres[0] ?? "";
  const runtime = formatRuntime(film.runtime);
  const totalWins = film.oscarWins + film.ggWins + film.cannesWins;
  const isHero = variant === "hero";

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { delay: index * 0.1, type: "spring", stiffness: 300, damping: 28 }
      }
      className={cn(
        "group relative flex flex-1 flex-col overflow-hidden border-[#1a1a28]",
        isHero
          ? "min-h-[56vh] border-b lg:min-h-0 lg:flex-[1.5] lg:border-b-0 lg:border-r"
          : "min-h-[34vh] border-b last:border-b-0 lg:min-h-0",
      )}
    >
      {/* Top accent strip — bold on the hero, a hairline on supporting cards so
          only one card's colour leads instead of three competing. */}
      <div
        className={cn("absolute inset-x-0 top-0 z-20", isHero ? "h-[3px]" : "h-px")}
        style={{ backgroundColor: isHero ? slot.accentColor : `${slot.accentColor}66` }}
      />

      {/* Backdrop */}
      <div className="relative flex-1">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={film.title}
            fill
            sizes={isHero ? "(max-width: 1024px) 100vw, 58vw" : "(max-width: 1024px) 100vw, 42vw"}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            priority={isHero}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] to-[#09090f]" />
        )}

        {/* Gradient — softer so the image breathes */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090f] via-[#09090f]/20 to-transparent" />

        {/* Ghost slot number — large on the hero, modest on supporting cards. */}
        <div
          className={cn(
            "pointer-events-none absolute select-none",
            isHero ? "right-4 top-5" : "right-3 top-3",
          )}
        >
          <span
            className="font-[family-name:var(--font-display)] font-black leading-none"
            style={{
              fontSize: isHero ? "10rem" : "4.5rem",
              color: `${slot.accentColor}12`,
              lineHeight: 1,
            }}
          >
            {slot.num}
          </span>
        </div>

        {/* Slot badge */}
        <div className={cn("absolute z-10", isHero ? "left-5 top-5" : "left-4 top-4")}>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border backdrop-blur-sm",
              "font-[family-name:var(--font-geist-mono)] uppercase tracking-widest",
              isHero ? "px-3 py-1.5 text-[11px]" : "px-2.5 py-1 text-[10px]",
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
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 z-10 flex flex-col",
          isHero ? "gap-2.5 p-6 sm:p-8" : "gap-1.5 p-5",
        )}
      >
        <span
          className={cn(
            "font-[family-name:var(--font-geist-mono)] uppercase tracking-[0.3em]",
            isHero ? "text-[11px]" : "text-[10px]",
          )}
          style={{ color: `${slot.accentColor}b3` }}
        >
          {slot.mood}
        </span>

        <h2
          className={cn(
            "font-[family-name:var(--font-display)] font-bold leading-[1.05] text-[#F5F5F0]",
            isHero ? "text-3xl sm:text-5xl" : "text-xl sm:text-2xl",
          )}
        >
          {film.title}
        </h2>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wider text-[#555570]">
            {film.year}
          </span>
          {isHero && runtime && (
            <>
              <span className="text-[#252538]">·</span>
              <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wider text-[#555570]">
                {runtime}
              </span>
            </>
          )}
          {genre && (
            <>
              <span className="text-[#252538]">·</span>
              <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wider text-[#555570]">
                {genre}
              </span>
            </>
          )}
        </div>

        {/* Director and the full critic-score row are hero-only, so supporting
            cards stay quiet and the hero clearly leads. */}
        {isHero && film.director && (
          <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wider text-[#3a3a56]">
            Dir. {film.director}
          </p>
        )}

        {isHero ? (
          <div className="flex items-center gap-3">
            {film.imdbRating != null ? (
              <span className="font-[family-name:var(--font-geist-mono)] text-[11px] font-bold text-[#c8c8d8]">
                ★ {film.imdbRating.toFixed(1)}
              </span>
            ) : (
              <span className="font-[family-name:var(--font-geist-mono)] text-[11px] font-bold text-[#c8c8d8]/40">
                No IMDb Score
              </span>
            )}
            {film.rtScore != null ? (
              <span className="font-[family-name:var(--font-geist-mono)] text-[11px] font-bold text-[#c8c8d8]">
                RT {film.rtScore}%
              </span>
            ) : (
              <span className="font-[family-name:var(--font-geist-mono)] text-[11px] font-bold text-[#c8c8d8]/40">
                No RT Score
              </span>
            )}
            {totalWins > 0 && (
              <span
                className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wide"
                style={{ color: slot.accentColor }}
              >
                {totalWins}× Winner
              </span>
            )}
          </div>
        ) : (
          (film.imdbRating != null || totalWins > 0) && (
            <div className="flex items-center gap-3">
              {film.imdbRating != null && (
                <span className="font-[family-name:var(--font-geist-mono)] text-[11px] font-bold text-[#c8c8d8]">
                  ★ {film.imdbRating.toFixed(1)}
                </span>
              )}
              {totalWins > 0 && (
                <span
                  className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-wide"
                  style={{ color: slot.accentColor }}
                >
                  {totalWins}× Winner
                </span>
              )}
            </div>
          )
        )}

        {/* CTA — the hero gets the single bold, fully-coloured button (plus
            quick actions); supporting cards get a restrained outline link, so
            colour weight reinforces the hierarchy rather than fighting it. */}
        {isHero ? (
          <div className="flex items-center gap-2 pt-1">
            <Link
              href={`/film/${film.slug}`}
              className={cn(
                "group/btn flex flex-1 items-center justify-between rounded-xl px-4 py-2.5",
                "font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-widest text-[#F5F5F0]",
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
        ) : (
          <Link
            href={`/film/${film.slug}`}
            className="group/btn mt-1 inline-flex w-fit items-center gap-2 rounded-lg border px-3.5 py-2 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-widest transition-colors duration-150 hover:bg-white/[0.04]"
            style={{ color: slot.accentColor, borderColor: `${slot.accentColor}40` }}
          >
            <span>Watch Tonight</span>
            <ArrowUpRight className="h-3 w-3 transition-transform duration-150 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </Link>
        )}
      </div>
    </motion.div>
  );
}
