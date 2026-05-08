"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Dices, Star, Trophy, ExternalLink, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { FilterBar } from "@/components/filter-bar";
import { PickOfDay } from "@/components/pick-of-day";
import {
  fetchAwardYears,
  fetchRandom,
  fetchFilms,
  fetchGenres,
  fetchCategories,
  type RollFilm,
} from "@/lib/api";
import { useFilters } from "@/hooks/useFilters";
import { cn } from "@/lib/utils";


export default function HomePage() {
  const { toast } = useToast();
  const { filters, setFilter, resetFilters, hasActiveFilters } = useFilters();
  const [film, setFilm] = useState<RollFilm | null>(null);
  const [backdropUrl, setBackdropUrl] = useState<string | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [spaceHintVisible, setSpaceHintVisible] = useState(false);
  const [filteredCount, setFilteredCount] = useState<number | null>(null);
  const [isCountLoading, setIsCountLoading] = useState(false);
  const [genres, setGenres] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [awardYears, setAwardYears] = useState<number[]>([]);

  // Ref so the space-key listener always calls the latest handleRoll
  const handleRollRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    void fetchGenres().then(setGenres);
    void fetchCategories().then(setCategories);
    void fetchAwardYears().then(setAwardYears);
    const t = setTimeout(() => setSpaceHintVisible(true), 1000);
    return () => clearTimeout(t);
  }, []);

  // Space key fires Roll without re-registering on every filter change
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (
        e.code === "Space" && !e.repeat &&
        tag !== "INPUT" && tag !== "TEXTAREA" && tag !== "BUTTON"
      ) {
        e.preventDefault();
        void handleRollRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!hasActiveFilters) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      setIsCountLoading(true);
      void fetchFilms(filters, 1)
        .then(r => { if (!cancelled) setFilteredCount(r.total); })
        .catch(() => { if (!cancelled) setFilteredCount(null); })
        .finally(() => { if (!cancelled) setIsCountLoading(false); });
    }, 300);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [filters, hasActiveFilters]);

  const effectiveCount = hasActiveFilters ? filteredCount : null;
  const effectiveCountLoading = hasActiveFilters && isCountLoading;
  const isRollDisabled = isRolling || (hasActiveFilters && effectiveCount === 0 && !effectiveCountLoading);

  async function handleRoll() {
    setIsRolling(true);
    setFilm(null);
    try {
      const result = await fetchRandom(filters);
      setFilm(result.film);
      setFilteredCount(result.total);
      setHasRolled(true);
      if (result.film.backdropUrl) setBackdropUrl(result.film.backdropUrl);
    } catch (err) {
      const code = err instanceof Error ? (err as Error & { code?: string }).code : undefined;
      if (code === "NO_FILMS_FOUND") {
        setFilteredCount(0);
        toast({ variant: "error", title: "No matches", description: "No films match your filters — try adjusting them." });
      } else {
        toast({ variant: "error", title: "Roll failed", description: "Couldn't fetch a random film. Please try again." });
      }
    } finally {
      setIsRolling(false);
    }
  }

  // Keep ref current so the space-key handler always has the latest closure
  handleRollRef.current = handleRoll;

  return (
    <div className="flex flex-col min-h-screen bg-[#09090f] text-[#F5F5F0]">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] sm:min-h-screen flex flex-col bg-[#09090f]">

        {/* Backdrop — cross-fades in when a film result arrives (400ms) */}
        <AnimatePresence>
          {backdropUrl && (
            <motion.div
              key={backdropUrl}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Image src={backdropUrl} alt="" fill className="object-cover" priority unoptimized />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Text-protection gradient — keeps content readable over the backdrop */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(to_top,#09090f_0%,#09090f_20%,rgba(9,9,15,0.55)_55%,transparent_100%)]" />

        {/* Cinema-dark overlay — fades in when rolling starts, out when done */}
        <AnimatePresence>
          {isRolling && (
            <motion.div
              key="cinema-dark"
              className="absolute inset-0 z-30 pointer-events-none bg-[#02020a]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.72 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeIn" }}
            />
          )}
        </AnimatePresence>

        {/* Cinematic loading bar — pinned to bottom of hero, above the overlay */}
        <AnimatePresence>
          {isRolling && (
            <motion.div
              key="loading-bar"
              className="absolute bottom-0 left-0 right-0 h-[2px] z-40 overflow-hidden pointer-events-none"
              style={{ background: "rgba(212,175,55,0.12)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <motion.div
                className="absolute inset-y-0 left-0 w-[40%]"
                style={{
                  background: "linear-gradient(to right, transparent, #D4AF37, transparent)",
                  boxShadow: "0 0 10px rgba(212,175,55,0.7)",
                }}
                animate={{ x: ["-100%", "250%"] }}
                transition={{ duration: 1.8, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.15 }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="relative z-20 flex flex-col flex-1">
          <header className="flex items-center justify-between px-5 sm:px-8 py-4">
            <span className="text-xl font-bold tracking-tight text-[#D4AF37]">CineRoll</span>
            <Link
              href="/browse"
              className="text-sm text-[#A0A0B0] hover:text-[#F5F5F0] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded"
            >
              Browse All
            </Link>
          </header>

          <div className="flex-1 flex flex-col items-center justify-between sm:justify-center px-4 py-6 sm:py-16 max-w-2xl mx-auto w-full gap-10 sm:gap-12">

            <div className="flex flex-col items-center text-center gap-5 w-full">
              <h1
                className={cn(
                  "font-[family-name:var(--font-display)] font-bold leading-[1.1] tracking-tight",
                  "text-[#F5F5F0] text-[clamp(2.5rem,6vw,5rem)]",
                )}
              >
                Roll Your Next<br />
                <span className="text-[#D4AF37]">Award&#8209;Winning</span> Film
              </h1>

              <p className="text-[#A0A0B0] text-sm sm:text-base tracking-[0.04em]">
                Oscar&nbsp;&middot;&nbsp;Golden Globe&nbsp;&middot;&nbsp;Cannes&nbsp;&middot;&nbsp;IMDb Top 250 Movies&nbsp;&middot;&nbsp;IMDb Top 250 TV
                &ensp;&mdash;&ensp;filtered exactly how you want
              </p>

              <FilterBar
                filters={filters}
                genres={genres}
                categories={categories}
                awardYears={awardYears}
                onFiltersChange={setFilter}
                onClearFilters={resetFilters}
                className="w-full"
              />

              <RollIndicator
                hasActiveFilters={hasActiveFilters}
                count={effectiveCount}
                loading={effectiveCountLoading}
              />
            </div>

            {/* Roll button + space hint */}
            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => void handleRoll()}
                disabled={isRollDisabled}
                aria-label={isRolling ? "Rolling…" : "Roll for a random film"}
                className={cn(
                  "flex items-center gap-3 min-h-[64px] px-12 sm:px-16",
                  "bg-[linear-gradient(to_bottom,#D4AF37,#B8962E)]",
                  "text-[#09090f] font-bold text-lg sm:text-xl",
                  "rounded-2xl shadow-lg shadow-[#D4AF37]/25",
                  "transition-all duration-200 select-none",
                  "hover:shadow-[0_0_36px_rgba(212,175,55,0.45)] hover:-translate-y-0.5",
                  "active:scale-[0.97]",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "disabled:hover:translate-y-0 disabled:hover:shadow-lg",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]",
                  "focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]",
                )}
              >
                <Dices
                  className={cn("h-6 w-6 shrink-0", isRolling && "animate-spin")}
                  aria-hidden
                />
                {isRolling ? "Rolling…" : "Roll"}
              </button>

              <AnimatePresence mode="wait">
                {isRolling ? (
                  <motion.p
                    key="finding"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="text-[#A0A0B0] text-xs tracking-wide"
                  >
                    Finding your film…
                  </motion.p>
                ) : (
                  <motion.p
                    key="space"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: spaceHintVisible ? 1 : 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-[#5a5a70] text-xs"
                  >
                    or press Space
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </section>

      {/* ── Below fold: roll result + pick of day ──────────────────── */}
      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-12 sm:py-20 gap-14 w-full max-w-3xl mx-auto">
        <div className="w-full">
          <AnimatePresence mode="wait">
            {isRolling && (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
              >
                <RollResultSkeleton />
              </motion.div>
            )}

            {!isRolling && film && (
              <motion.div
                key={film.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
                className="flex flex-col gap-6"
              >
                <RollResultCard film={film} />

                {/* Roll Again — appears after the card spring has settled */}
                <motion.div
                  className="flex justify-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.45, ease: "easeOut" }}
                >
                  <button
                    onClick={() => void handleRoll()}
                    disabled={isRollDisabled}
                    aria-label="Roll again for a random film"
                    className={cn(
                      "flex items-center gap-2.5 h-12 px-10",
                      "bg-[linear-gradient(to_bottom,#D4AF37,#B8962E)]",
                      "text-[#09090f] font-bold text-base",
                      "rounded-xl shadow-lg shadow-[#D4AF37]/20",
                      "transition-all duration-200 select-none",
                      "hover:shadow-[0_0_24px_rgba(212,175,55,0.38)] hover:-translate-y-0.5",
                      "active:scale-[0.97]",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "disabled:hover:translate-y-0 disabled:hover:shadow-lg",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]",
                      "focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]",
                    )}
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden />
                    Roll Again
                  </button>
                </motion.div>
              </motion.div>
            )}

            {!isRolling && !hasRolled && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center rounded-2xl border border-dashed border-[#22222f] py-14"
              >
                <p className="text-[#5a5a70] text-sm">Roll to discover your next film</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <PickOfDay />
      </main>
    </div>
  );
}

function RollIndicator({
  hasActiveFilters,
  count,
  loading,
}: {
  hasActiveFilters: boolean;
  count: number | null;
  loading: boolean;
}) {
  if (!hasActiveFilters) return null;
  if (loading || count === null) {
    return <p className="text-xs text-[#5a5a70] min-h-[1rem]">Checking filters…</p>;
  }
  if (count === 0) {
    return (
      <p className="text-xs text-[#8B1A1A] min-h-[1rem]">
        No films match — adjust your filters
      </p>
    );
  }
  return (
    <p className="text-xs text-[#A0A0B0] min-h-[1rem]">
      Rolling from{" "}
      <span className="font-semibold text-[#D4AF37]">{count}</span>{" "}
      {count === 1 ? "film" : "films"}
    </p>
  );
}

function RollResultCard({ film }: { film: RollFilm }) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row gap-5 sm:gap-6",
        "rounded-2xl border border-[#22222f] bg-[#111118] p-5 sm:p-6",
        "shadow-xl shadow-black/50",
      )}
    >
      <div className="relative mx-auto w-40 shrink-0 sm:mx-0 sm:w-36 rounded-xl overflow-hidden border border-[#22222f] aspect-[2/3]">
        {film.posterUrl ? (
          <Image
            src={film.posterUrl}
            alt={`${film.title} poster`}
            fill
            sizes="(max-width: 640px) 160px, 144px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a24]">
            <span className="text-xs text-[#5a5a70]">No poster</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 min-w-0 flex-1">
        <div>
          {/* Year line fades in first */}
          <motion.p
            className="text-sm text-[#A0A0B0]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0 }}
          >
            {film.year}
            {film.director ? ` · Directed by ${film.director}` : ""}
            {film.runtime != null ? ` · ${film.runtime} min` : ""}
          </motion.p>
          {/* Title fades in 100ms later with a subtle lift */}
          <motion.h2
            className={cn(
              "font-[family-name:var(--font-display)] font-bold leading-tight",
              "text-xl sm:text-2xl text-[#F5F5F0]",
            )}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {film.title}
          </motion.h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {film.imdbRating != null && (
            <span className="flex items-center gap-1 text-[#D4AF37] font-semibold text-sm">
              <Star className="h-4 w-4 fill-[#D4AF37]" aria-hidden />
              {film.imdbRating.toFixed(1)}
            </span>
          )}
          {film.oscarWins > 0 && (
            <span className="flex items-center gap-1.5 text-[#D4AF37] text-xs font-medium">
              <Trophy className="h-3.5 w-3.5" aria-hidden />
              {film.oscarWins} Oscar {film.oscarWins === 1 ? "win" : "wins"}
            </span>
          )}
          {film.genres.slice(0, 3).map(g => (
            <span
              key={g}
              className="rounded-full border border-[#22222f] px-2.5 py-0.5 text-xs text-[#A0A0B0]"
            >
              {g}
            </span>
          ))}
        </div>

        {film.plot && (
          <p className="text-sm text-[#A0A0B0] leading-relaxed line-clamp-3">
            {film.plot}
          </p>
        )}

        <Link
          href={`/film/${film.slug}`}
          className={cn(
            "inline-flex items-center gap-1.5 self-start mt-auto",
            "text-xs font-medium text-[#D4AF37] hover:text-[#D4AF37]/80 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] rounded",
          )}
        >
          View full details
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}

function RollResultSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 rounded-2xl border border-[#22222f] bg-[#111118] p-5 sm:p-6">
      <Skeleton className="mx-auto w-40 shrink-0 sm:mx-0 sm:w-36 aspect-[2/3] rounded-xl" />
      <div className="flex flex-col gap-3 flex-1">
        <Skeleton className="h-7 w-3/4 rounded-lg" />
        <Skeleton className="h-4 w-1/2 rounded-lg" />
        <div className="flex gap-2 mt-1">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-full rounded-lg mt-1" />
        <Skeleton className="h-4 w-5/6 rounded-lg" />
        <Skeleton className="h-4 w-2/3 rounded-lg" />
      </div>
    </div>
  );
}
