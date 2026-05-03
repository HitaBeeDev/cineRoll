"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Dices, Star, Trophy, ExternalLink, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { FilterBar } from "@/components/filter-bar";
import { PickOfDay } from "@/components/pick-of-day";
import { fetchRandom, fetchFilms, fetchGenres, type RollFilm } from "@/lib/api";
import { useFilters } from "@/hooks/useFilters";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { toast } = useToast();
  const { filters, setFilter, hasActiveFilters } = useFilters();
  const [film, setFilm] = useState<RollFilm | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [hasRolled, setHasRolled] = useState(false);
  const [filteredCount, setFilteredCount] = useState<number | null>(null);
  const [isCountLoading, setIsCountLoading] = useState(false);
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    void fetchGenres().then(setGenres);
  }, []);

  useEffect(() => {
    if (!hasActiveFilters) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      setIsCountLoading(true);
      void fetchFilms(filters, 1)
        .then(result => {
          if (!cancelled) setFilteredCount(result.total);
        })
        .catch(() => {
          if (!cancelled) setFilteredCount(null);
        })
        .finally(() => {
          if (!cancelled) setIsCountLoading(false);
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [filters, hasActiveFilters]);

  // When no filters are active, treat count as null regardless of stale state
  const effectiveCount = hasActiveFilters ? filteredCount : null;
  const isRollDisabled = isRolling || (hasActiveFilters && effectiveCount === 0 && !isCountLoading);

  async function handleRoll() {
    setIsRolling(true);
    setFilm(null);
    try {
      const result = await fetchRandom(filters);
      setFilm(result.film);
      setFilteredCount(result.total);
      setHasRolled(true);
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

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
      <header className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-zinc-800/60">
        <span className="text-xl font-bold tracking-tight text-amber-400">CineRoll</span>
        <Link
          href="/browse"
          className={cn(
            "text-sm text-zinc-400 hover:text-zinc-100 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
          )}
        >
          Browse All
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-12 sm:py-20 gap-14 w-full max-w-3xl mx-auto">
        {/* Hero */}
        <section className="flex flex-col items-center text-center gap-5 w-full">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-zinc-50 leading-tight">
            What&apos;s your next watch?
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg max-w-xs sm:max-w-sm">
            Roll for a random award-winning film you might have missed.
          </p>

          <Button
            size="lg"
            variant="primary"
            onClick={() => void handleRoll()}
            disabled={isRollDisabled}
            aria-label={isRolling ? "Rolling…" : "Roll for a random film"}
            className={cn(
              "mt-3 gap-3 px-10 h-14 text-lg sm:h-16 sm:text-xl sm:px-14",
              "rounded-2xl shadow-lg shadow-amber-400/20"
            )}
          >
            <Dices
              className={cn("h-6 w-6 shrink-0", isRolling && "animate-spin")}
              aria-hidden
            />
            {isRolling ? "Rolling…" : "Roll"}
          </Button>

          <RollIndicator
            hasActiveFilters={hasActiveFilters}
            count={effectiveCount}
            loading={isCountLoading}
          />

          <FilterBar
            filters={filters}
            genres={genres}
            onFiltersChange={setFilter}
            className="w-full"
          />
        </section>

        {/* Roll result */}
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
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ type: "spring", stiffness: 300, damping: 28 }}
                className="flex flex-col gap-4"
              >
                <RollResultCard film={film} />
                <div className="flex justify-center">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => void handleRoll()}
                    disabled={isRollDisabled}
                    className="gap-2"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden />
                    Roll Again
                  </Button>
                </div>
              </motion.div>
            )}

            {!isRolling && !hasRolled && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center rounded-2xl border border-dashed border-zinc-800 py-14"
              >
                <p className="text-zinc-600 text-sm">Roll to discover your next film</p>
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
    return <p className="text-xs text-zinc-500 min-h-[1rem]">Checking filters…</p>;
  }

  if (count === 0) {
    return (
      <p className="text-xs text-red-400 min-h-[1rem]">
        No films match — adjust your filters
      </p>
    );
  }

  return (
    <p className="text-xs text-zinc-400 min-h-[1rem]">
      Rolling from{" "}
      <span className="font-semibold text-amber-400">{count}</span>{" "}
      {count === 1 ? "film" : "films"}
    </p>
  );
}

function RollResultCard({ film }: { film: RollFilm }) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row gap-5 sm:gap-6",
        "rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6",
        "shadow-xl shadow-black/50"
      )}
    >
      <div className="relative mx-auto w-40 shrink-0 sm:mx-0 sm:w-36 rounded-xl overflow-hidden border border-zinc-800 aspect-[2/3]">
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
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
            <span className="text-xs text-zinc-600">No poster</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 min-w-0 flex-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-50 leading-tight">
            {film.title}
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            {film.year}
            {film.director ? ` · Directed by ${film.director}` : ""}
            {film.runtime != null ? ` · ${film.runtime} min` : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {film.imdbRating != null && (
            <span className="flex items-center gap-1 text-amber-400 font-semibold text-sm">
              <Star className="h-4 w-4 fill-amber-400" aria-hidden />
              {film.imdbRating.toFixed(1)}
            </span>
          )}
          {film.oscarWins > 0 && (
            <span className="flex items-center gap-1.5 text-amber-400 text-xs font-medium">
              <Trophy className="h-3.5 w-3.5" aria-hidden />
              {film.oscarWins} Oscar {film.oscarWins === 1 ? "win" : "wins"}
            </span>
          )}
          {film.genres.slice(0, 3).map((g) => (
            <span
              key={g}
              className="rounded-full border border-zinc-700 px-2.5 py-0.5 text-xs text-zinc-300"
            >
              {g}
            </span>
          ))}
        </div>

        {film.plot && (
          <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3">
            {film.plot}
          </p>
        )}

        <Link
          href={`/film/${film.slug}`}
          className={cn(
            "inline-flex items-center gap-1.5 self-start mt-auto",
            "text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
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
    <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
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
