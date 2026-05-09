"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Bookmark, Check, Share2, Dices } from "lucide-react";
import type { AwardRecord } from "@cineroll/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { FilterBar } from "@/components/filter-bar";
import { SiteNavigation } from "@/components/site-navigation";
import {
  fetchAwardYears,
  fetchRandom,
  fetchFilms,
  fetchGenres,
  fetchCategories,
  fetchOnboardingTasteCards,
  type RollFilm,
  type TasteCardFilm,
} from "@/lib/api";
import { formatRuntime } from "@/lib/format";
import { useFilters } from "@/hooks/useFilters";
import { cn } from "@/lib/utils";

const ONBOARDED_STORAGE_KEY = "cineroll_onboarded";
const PENDING_WATCHED_STORAGE_KEY = "cineroll_pending_watched_films";
const TASTE_SEED_STORAGE_KEY = "cineroll_taste_seed";

type PendingWatchedFilm = {
  filmId: string;
  watchedAt: string;
  source: "onboarding";
  synced: false;
};

type TasteSeed = {
  source: "onboarding";
  filmIds: string[];
  genres: string[];
  primaryGenre: string | null;
  createdAt: string;
};

function savePendingWatchedFilms(filmIds: string[]) {
  if (filmIds.length === 0) return;

  try {
    const existing = JSON.parse(
      window.localStorage.getItem(PENDING_WATCHED_STORAGE_KEY) ?? "[]",
    ) as Partial<PendingWatchedFilm>[];
    const byFilmId = new Map<string, PendingWatchedFilm>();

    for (const item of existing) {
      if (typeof item.filmId !== "string") continue;
      byFilmId.set(item.filmId, {
        filmId: item.filmId,
        watchedAt: typeof item.watchedAt === "string" ? item.watchedAt : new Date().toISOString(),
        source: "onboarding",
        synced: false,
      });
    }

    const watchedAt = new Date().toISOString();
    for (const filmId of filmIds) {
      byFilmId.set(filmId, {
        filmId,
        watchedAt,
        source: "onboarding",
        synced: false,
      });
    }

    window.localStorage.setItem(
      PENDING_WATCHED_STORAGE_KEY,
      JSON.stringify([...byFilmId.values()]),
    );
  } catch {
    // If storage is unavailable, onboarding should still be completable.
  }
}

function createTasteSeed(films: TasteCardFilm[], selectedFilmIds: string[]): TasteSeed | null {
  if (selectedFilmIds.length === 0) return null;

  const selectedIds = new Set(selectedFilmIds);
  const selectedFilms = films.filter((film) => selectedIds.has(film.id));
  if (selectedFilms.length === 0) return null;

  const genreCounts = new Map<string, number>();
  for (const film of selectedFilms) {
    for (const genre of film.genres) {
      genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1);
    }
  }

  const genres = [...genreCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([genre]) => genre);

  return {
    source: "onboarding",
    filmIds: selectedFilmIds,
    genres,
    primaryGenre: genres[0] ?? null,
    createdAt: new Date().toISOString(),
  };
}

function saveTasteSeed(seed: TasteSeed | null) {
  if (!seed) return;

  try {
    window.localStorage.setItem(TASTE_SEED_STORAGE_KEY, JSON.stringify(seed));
  } catch {
    // If storage is unavailable, onboarding should still be completable.
  }
}

export default function HomePage() {
  const shouldReduceMotion = useReducedMotion();
  const { toast } = useToast();
  const { filters, setFilter, resetFilters, hasActiveFilters } = useFilters();
  const [film, setFilm] = useState<RollFilm | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [filteredCount, setFilteredCount] = useState<number | null>(null);
  const [isCountLoading, setIsCountLoading] = useState(false);
  const [genres, setGenres] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [awardYears, setAwardYears] = useState<number[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [onboardingState, setOnboardingState] = useState<"checking" | "show" | "done">("checking");
  const [tasteCards, setTasteCards] = useState<TasteCardFilm[]>([]);
  const [tasteCardsStatus, setTasteCardsStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  const handleRollRef = useRef<() => Promise<void>>(async () => {});
  const filmCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        setOnboardingState(
          window.localStorage.getItem(ONBOARDED_STORAGE_KEY) === "true" ? "done" : "show",
        );
      } catch {
        setOnboardingState("done");
      }
    }, 0);

    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (onboardingState !== "show") return;
    let cancelled = false;
    const id = window.setTimeout(() => {
      setTasteCardsStatus("loading");
      void fetchOnboardingTasteCards()
        .then((films) => {
          if (cancelled) return;
          setTasteCards(films);
          setTasteCardsStatus(films.length > 0 ? "ready" : "error");
        })
        .catch(() => {
          if (!cancelled) setTasteCardsStatus("error");
        });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [onboardingState]);

  // Fetch filter metadata + total film count
  useEffect(() => {
    void fetchGenres().then(setGenres);
    void fetchCategories().then(setCategories);
    void fetchAwardYears().then(setAwardYears);
    void fetchRandom().then((r) => setTotalCount(r.total)).catch(() => {});
  }, []);

  // Space key fires roll
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName;
      if (
        e.code === "Space" &&
        !e.repeat &&
        tag !== "INPUT" &&
        tag !== "TEXTAREA" &&
        tag !== "BUTTON"
      ) {
        e.preventDefault();
        void handleRollRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Count films matching active filters (debounced)
  useEffect(() => {
    if (!hasActiveFilters) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      setIsCountLoading(true);
      void fetchFilms(filters, 1)
        .then((r) => {
          if (!cancelled) setFilteredCount(r.total);
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

  const effectiveCount = hasActiveFilters ? filteredCount : null;
  const effectiveCountLoading = hasActiveFilters && isCountLoading;
  const isRollDisabled =
    isRolling ||
    (hasActiveFilters && effectiveCount === 0 && !effectiveCountLoading);

  async function handleRoll() {
    setIsRolling(true);
    setFilm(null);
    try {
      const result = await fetchRandom(filters);
      setFilm(result.film);
      setFilteredCount(result.total);
      // Scroll to film card on mobile
      setTimeout(
        () =>
          filmCardRef.current?.scrollIntoView({
            behavior: shouldReduceMotion ? "auto" : "smooth",
            block: "start",
          }),
        100,
      );
    } catch (err) {
      const code =
        err instanceof Error
          ? (err as Error & { code?: string }).code
          : undefined;
      if (code === "NO_FILMS_FOUND") {
        setFilteredCount(0);
        toast({
          variant: "error",
          title: "No matches",
          description: "No films match your filters — try adjusting them.",
        });
      } else {
        toast({
          variant: "error",
          title: "Couldn't connect",
          description: "Check your connection and try again.",
        });
      }
    } finally {
      setIsRolling(false);
    }
  }

  // Keep ref in sync so space-key handler always calls latest version
  useEffect(() => {
    handleRollRef.current = handleRoll;
  });


  // Pool count display
  const poolCountStr = effectiveCountLoading
    ? "···"
    : effectiveCount !== null
      ? String(effectiveCount).padStart(3, "0")
      : filteredCount !== null
        ? String(filteredCount).padStart(3, "0")
        : totalCount !== null
          ? String(totalCount).padStart(3, "0")
          : "···";

  if (onboardingState === "checking") {
    return <div className="min-h-screen bg-[#09090f]" aria-hidden />;
  }

  if (onboardingState === "show") {
    return (
      <FirstVisitOnboarding
        tasteCards={tasteCards}
        tasteCardsStatus={tasteCardsStatus}
        onRetryTasteCards={() => {
          setTasteCardsStatus("loading");
          void fetchOnboardingTasteCards()
            .then((films) => {
              setTasteCards(films);
              setTasteCardsStatus(films.length > 0 ? "ready" : "error");
            })
            .catch(() => setTasteCardsStatus("error"));
        }}
        onContinue={(seed) => {
          if (seed?.primaryGenre) {
            setFilter({ genre: seed.primaryGenre, page: 1 });
          }
          try {
            window.localStorage.setItem(ONBOARDED_STORAGE_KEY, "true");
          } catch {}
          setOnboardingState("done");
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#09090f] text-[#F5F5F0]">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b border-[#1a1a28] bg-[#09090f] px-5 sm:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="font-[family-name:var(--font-geist-mono)] text-[1.1rem] font-bold uppercase tracking-[0.15em] text-[#e8453c]"
          >
            Cine·Roll
          </Link>
          <span className="hidden items-center rounded-full border border-[#e8453c]/25 px-2.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#e8453c]/55 sm:inline-flex">
            Now Showing
          </span>
        </div>
        <SiteNavigation />
      </header>

      {/* ── Two-column body ─────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col lg:grid lg:grid-cols-12 lg:h-[calc(100vh-4rem)] lg:overflow-hidden">
        {/* LEFT: hero + filters + roll ──────────────────────────────── */}
        <div className="flex flex-col gap-3 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:w-0 px-5 py-4 sm:px-8 lg:px-10 lg:py-5 lg:col-span-7">
          {/* Channel label */}
          <p className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.25em] text-[#888899]">
            {"// CHANNEL 03 · TONIGHT"}
          </p>

          {/* Hero headline */}
          <div className="mb-7">
            <h1
              className={cn(
                "font-[family-name:var(--font-display)] font-bold leading-[1.0] tracking-tight",
                "text-[clamp(3.8rem,4.2vw,3.8rem)] text-[#F5F5F0]",
              )}
            >
              One spin.
              <br />
              <span className="text-[#e8453c]">One film.</span>
              <br />
              Tonight.
            </h1>
          </div>

          {/* Filters */}
          <FilterBar
            filters={filters}
            genres={genres}
            categories={categories}
            awardYears={awardYears}
            onFiltersChange={setFilter}
            onClearFilters={resetFilters}
          />

          {/* ROLL button + pool count — side by side */}
          <div className="flex items-center gap-4">
            {/* Marquee-border ROLL box */}
            <div className="w-[185px] shrink-0 rounded-2xl border-2 border-dashed border-[#e8453c]/30 p-1.5">
              <button
                onClick={() => void handleRoll()}
                disabled={isRollDisabled}
                aria-label={isRolling ? "Rolling…" : "Roll for a random film"}
                className={cn(
                  "w-full rounded-xl py-[18px]",
                  "bg-[#e8453c] text-[#F5F5F0]",
                  "font-[family-name:var(--font-geist-mono)] text-xl font-bold uppercase tracking-[0.25em]",
                  "select-none transition-all duration-150",
                  "hover:bg-[#d5342b] hover:shadow-[0_0_40px_rgba(232,69,60,0.28)]",
                  "active:scale-[0.98]",
                  "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:shadow-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
                  "focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]",
                )}
              >
                {isRolling ? "Rolling…" : "Roll"}
              </button>
            </div>

            {/* Pool counter — to the right of the ROLL box */}
            <div className="shrink-0 flex flex-col gap-0.5">
              <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#555568]">
                Reel Pool
              </span>
              <span className="font-[family-name:var(--font-geist-mono)] text-[2rem] font-bold leading-none text-[#e8453c]">
                {poolCountStr}
              </span>
              <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#555568]">
                Films
              </span>
              <span className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-widest text-[#444458]">
                Press [Space] to spin
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: film card ──────────────────────────────────────────── */}
        <div
          ref={filmCardRef}
          className={cn(
            "border-t border-[#1a1a28] lg:border-t-0 lg:border-l",
            "lg:col-span-5",
            "min-h-[400px] lg:min-h-0 lg:flex lg:flex-col lg:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:w-0",
            "p-4",
          )}
        >
          <AnimatePresence mode="wait">
            {isRolling ? (
              <motion.div
                key="skeleton"
                layout={!shouldReduceMotion}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: shouldReduceMotion ? 0 : 0.15, ease: "easeIn" } }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.15, ease: "easeOut" }}
              >
                <FilmCardSkeleton />
              </motion.div>
            ) : film ? (
              <motion.div
                key={film.id}
                layout={!shouldReduceMotion}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: shouldReduceMotion ? 0 : 0.15, ease: "easeIn" } }}
                transition={shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 28 }}
              >
                <FilmCard film={film} />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                layout={!shouldReduceMotion}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: shouldReduceMotion ? 0 : 0.15, ease: "easeIn" } }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" }}
                className="flex flex-col flex-1"
              >
                <FilmCardEmpty />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function FirstVisitOnboarding({
  tasteCards,
  tasteCardsStatus,
  onRetryTasteCards,
  onContinue,
}: {
  tasteCards: TasteCardFilm[];
  tasteCardsStatus: "idle" | "loading" | "ready" | "error";
  onRetryTasteCards: () => void;
  onContinue: (seed: TasteSeed | null) => void;
}) {
  const [selectedSeenIds, setSelectedSeenIds] = useState<Set<string>>(new Set());
  const selectedSeenCount = selectedSeenIds.size;

  function toggleSeen(filmId: string) {
    setSelectedSeenIds((current) => {
      const next = new Set(current);
      if (next.has(filmId)) {
        next.delete(filmId);
      } else {
        next.add(filmId);
      }
      return next;
    });
  }

  function completeOnboarding() {
    const selectedFilmIds = [...selectedSeenIds];
    const seed = createTasteSeed(tasteCards, selectedFilmIds);
    savePendingWatchedFilms(selectedFilmIds);
    saveTasteSeed(seed);
    onContinue(seed);
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#09090f] text-[#F5F5F0]">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_72%_28%,rgba(232,69,60,0.16),transparent_32%),linear-gradient(135deg,#09090f_0%,#11111b_48%,#07070c_100%)]" />
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.045] [background-image:linear-gradient(rgba(245,245,240,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(245,245,240,0.5)_1px,transparent_1px)] [background-size:56px_56px]" />

      <header className="relative z-20 flex h-16 shrink-0 items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="font-[family-name:var(--font-geist-mono)] text-[1.1rem] font-bold uppercase tracking-[0.15em] text-[#e8453c]"
        >
          Cine·Roll
        </Link>
        <button
          type="button"
          onClick={completeOnboarding}
          className="font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-[0.28em] text-[#888899] transition hover:text-[#F5F5F0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]"
        >
          Skip
        </button>
      </header>

      <main className="relative z-20 grid flex-1 grid-cols-1 gap-8 px-5 pb-8 pt-4 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-10 lg:px-10 lg:pb-10 lg:pt-0">
        <section className="flex max-w-xl flex-col items-start">
          <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.35em] text-[#D4AF37]">
            {"// Taste check"}
          </p>

          <h1 className="mt-5 font-[family-name:var(--font-display)] text-[clamp(3.15rem,7vw,6rem)] font-bold leading-[0.9] tracking-tight">
            Which of these have you seen?
          </h1>

          <p className="mt-5 max-w-md text-base leading-7 text-[#a6a6b5]">
            Pick the films you already know. CineRoll uses this first signal to shape better rolls after you enter.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={completeOnboarding}
              className={cn(
                "min-w-[180px] bg-[#F5F5F0] px-7 py-4 text-[#09090f]",
                "font-[family-name:var(--font-geist-mono)] text-sm font-bold uppercase tracking-[0.2em]",
                "transition hover:bg-white hover:shadow-[0_18px_50px_rgba(245,245,240,0.16)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]",
              )}
            >
              Done{selectedSeenCount > 0 ? ` (${selectedSeenCount})` : ""}
            </button>
            <button
              type="button"
              onClick={completeOnboarding}
              className={cn(
                "min-w-[180px] border border-[#2a2a3e] bg-[#11111b]/70 px-7 py-4 text-[#888899]",
                "font-[family-name:var(--font-geist-mono)] text-sm font-bold uppercase tracking-[0.2em]",
                "transition hover:border-[#4b4b60] hover:text-[#F5F5F0]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]",
              )}
            >
              Skip
            </button>
          </div>

          <div className="mt-6 flex items-center gap-3 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.22em] text-[#555568]">
            <span className="h-px w-9 bg-[#e8453c]/55" />
            {selectedSeenCount === 0 ? "Tap any poster" : `${selectedSeenCount} selected`}
          </div>
        </section>

        <section className="min-h-0">
          <div className="mx-auto grid w-full max-w-5xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {tasteCardsStatus === "error" ? (
              <div className="col-span-2 flex min-h-[420px] items-center justify-center border border-dashed border-[#2a2a3e] bg-[#080810]/80 sm:col-span-4">
                <div className="text-center">
                  <p className="text-sm text-[#F5F5F0]">Could not load taste cards.</p>
                  <button
                    type="button"
                    onClick={onRetryTasteCards}
                    className="mt-2 font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-widest text-[#e8453c] transition hover:text-[#F5F5F0]"
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : tasteCardsStatus === "ready" && tasteCards.length > 0 ? (
              tasteCards.slice(0, 8).map((film) => {
                const selected = selectedSeenIds.has(film.id);
                return (
                  <button
                    key={film.id}
                    type="button"
                    onClick={() => toggleSeen(film.id)}
                    aria-pressed={selected}
                    aria-label={`${selected ? "Unmark" : "Mark"} ${film.title} as seen`}
                    className={cn(
                      "group relative overflow-hidden border bg-[#09090f] text-left shadow-[0_22px_70px_rgba(0,0,0,0.34)] transition duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090f]",
                      selected
                        ? "border-[#e8453c] shadow-[0_0_0_1px_rgba(232,69,60,0.28),0_24px_80px_rgba(232,69,60,0.2)]"
                        : "border-white/10 hover:-translate-y-1 hover:border-white/30",
                    )}
                    style={{ aspectRatio: "2/3" }}
                  >
                    {film.posterUrl ? (
                      <Image
                        src={film.posterUrl}
                        alt={`${film.title} poster`}
                        fill
                        sizes="(max-width: 640px) 45vw, 18vw"
                        className={cn(
                          "object-cover transition duration-300",
                          selected ? "scale-[1.03] saturate-[0.85]" : "group-hover:scale-[1.035]",
                        )}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#11111b] p-4 text-center">
                        <span className="font-[family-name:var(--font-display)] text-lg font-semibold leading-tight text-[#F5F5F0]">
                          {film.title}
                        </span>
                      </div>
                    )}
                    <div className={cn("pointer-events-none absolute inset-0 transition", selected ? "bg-[#09090f]/30" : "bg-transparent")} />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent px-3 pb-3 pt-14">
                      <p className="line-clamp-2 font-[family-name:var(--font-display)] text-sm font-semibold leading-tight text-white">
                        {film.title}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur transition",
                        selected
                          ? "border-[#e8453c] bg-[#e8453c] text-white"
                          : "border-white/25 bg-black/35 text-white/0 group-hover:text-white/80",
                      )}
                    >
                      <Check className="h-4 w-4" aria-hidden />
                    </span>
                  </button>
                );
              })
            ) : (
              Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse border border-white/10 bg-[#11111b]/80"
                  style={{ aspectRatio: "2/3" }}
                />
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

// ── Film card ────────────────────────────────────────────────────────────────

function FilmCard({ film }: { film: RollFilm }) {
  const [showAllAwards, setShowAllAwards] = useState(false);
  const channelLabel = `REEL // ${film.title.toUpperCase().slice(0, 11)}`;
  const genre = film.genres[0] ?? "";
  const runtime = formatRuntime(film.runtime);
  const imageUrl = film.backdropUrl ?? film.posterUrl;
  const totalWins = film.oscarWins + film.ggWins + film.cannesWins;
  const totalNoms =
    film.oscarNominations + film.ggNominations + film.cannesNominations;
  const allAwards = getAwardGroups(film);
  const visibleAwardGroups = getVisibleAwardGroups(allAwards, showAllAwards ? Number.POSITIVE_INFINITY : 5);

  return (
    <div className="flex flex-col">
      {/* Channel pill */}
      <div className="flex items-center -mx-1 -mt-1 mb-2">
        <span className="inline-flex items-center rounded-full border border-[#e8453c]/22 bg-[#e8453c]/10 px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#e8453c]">
          {channelLabel}
        </span>
      </div>

      {/* Backdrop / poster image */}
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: "16/9" }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={film.title}
            fill
            sizes="(max-width: 1024px) 100vw, 500px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1a1a2e] to-[#0a0a18]">
            <span className="font-[family-name:var(--font-geist-mono)] text-xs uppercase tracking-widest text-[#888899]">
              No image
            </span>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#09090f]/55 to-transparent" />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-4">
        {/* Year · Runtime · Genre */}
        <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.2em] text-[#888899]">
          {film.year}
          {runtime && ` · ${runtime}`}
          {genre && ` · ${genre}`}
        </p>

        {/* Title + bookmark */}
        <div className="flex items-start justify-between gap-3 mt-1">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold leading-tight text-[#F5F5F0] sm:text-2xl">
            {film.title}
          </h2>
          <button
            type="button"
            aria-label="Add to watchlist"
            className="mt-0.5 shrink-0 text-[#444458] transition-colors hover:text-[#e8453c] focus-visible:outline-none"
          >
            <Bookmark className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Director */}
        {film.director && (
          <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.2em] text-[#888899]">
            Dir. {film.director}
          </p>
        )}

        {/* Plot */}
        {film.plot && (
          <p className="line-clamp-3 text-xs leading-relaxed text-[#888899]">
            {film.plot}
          </p>
        )}

        {/* Stats boxes */}
        <div className="grid grid-cols-3 gap-2 mt-2">
          <StatBox
            label="IMDb"
            value={film.imdbRating != null ? film.imdbRating.toFixed(1) : "—"}
          />
          <StatBox
            label="RT"
            value={film.rtScore != null ? `${film.rtScore}%` : "—"}
          />
          <StatBox
            label="Awards"
            value={
              totalWins > 0
                ? `${totalWins}W`
                : totalNoms > 0
                  ? `${totalNoms}N`
                  : "—"
            }
          />
        </div>

        {/* Award tags */}
        {totalWins > 0 || totalNoms > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {film.oscarWins > 0 && (
              <AwardTag>
                + {film.oscarWins} Oscar {film.oscarWins === 1 ? "Win" : "Wins"}
              </AwardTag>
            )}
            {film.oscarNominations > film.oscarWins && (
              <AwardTag>
                + {film.oscarNominations} Oscar Nom
                {film.oscarNominations !== 1 ? "s" : ""}
              </AwardTag>
            )}
            {film.ggWins > 0 && (
              <AwardTag>
                + {film.ggWins} GG {film.ggWins === 1 ? "Win" : "Wins"}
              </AwardTag>
            )}
            {film.ggNominations > film.ggWins && (
              <AwardTag>
                + {film.ggNominations} GG Nom
                {film.ggNominations !== 1 ? "s" : ""}
              </AwardTag>
            )}
            {film.cannesWins > 0 && (
              <AwardTag>
                + {film.cannesWins} Cannes{" "}
                {film.cannesWins === 1 ? "Win" : "Wins"}
              </AwardTag>
            )}
            {film.cannesNominations > film.cannesWins && (
              <AwardTag>
                + {film.cannesNominations} Cannes Nom
                {film.cannesNominations !== 1 ? "s" : ""}
              </AwardTag>
            )}
          </div>
        ) : null}

        {allAwards.length > 0 ? (
          <div className="mt-1 rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-[0.2em] text-[#888899]">
                Nominees & awards
              </h3>
              {countAwardRecords(allAwards) > 5 && (
                <button
                  type="button"
                  onClick={() => setShowAllAwards((current) => !current)}
                  className="font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-widest text-[#e8453c] transition hover:text-[#F5F5F0] focus-visible:outline-none"
                >
                  {showAllAwards ? "Show less" : "Show more"}
                </button>
              )}
            </div>
            <div className="space-y-3">
              {visibleAwardGroups.map((group) => (
                <AwardGroup
                  key={group.label}
                  label={group.label}
                  records={group.records}
                />
              ))}
            </div>
          </div>
        ) : null}

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-1">
          <Link
            href={`/film/${film.slug}`}
            className={cn(
              "flex flex-1 items-center justify-center rounded-xl py-3",
              "bg-[#e8453c] text-[#F5F5F0]",
              "font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.2em]",
              "transition-colors hover:bg-[#d5342b]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
            )}
          >
            View Full Details
          </Link>
          <ActionBtn aria-label="Mark as watched">
            <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest">
              Watched
            </span>
          </ActionBtn>
          <ActionBtn aria-label="Pass on this film">
            <span className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest">
              Pass
            </span>
          </ActionBtn>
          <ActionBtn aria-label="Share">
            <Share2 className="h-4 w-4" aria-hidden />
          </ActionBtn>
        </div>
      </div>
    </div>
  );
}

type AwardGroupData = {
  label: string;
  records: AwardRecord[];
};

function getAwardGroups(film: RollFilm): AwardGroupData[] {
  return [
    { label: "Oscar", records: film.oscarCategories },
    { label: "Golden Globe", records: film.ggCategories },
    { label: "Cannes", records: film.cannesCategories },
  ].filter((group) => group.records.length > 0);
}

function countAwardRecords(groups: AwardGroupData[]) {
  return groups.reduce((total, group) => total + group.records.length, 0);
}

function getVisibleAwardGroups(groups: AwardGroupData[], limit: number): AwardGroupData[] {
  let remaining = limit;

  return groups
    .map((group) => {
      if (remaining <= 0) return { ...group, records: [] };
      const records = group.records.slice(0, remaining);
      remaining -= records.length;
      return { ...group, records };
    })
    .filter((group) => group.records.length > 0);
}

function AwardGroup({ label, records }: AwardGroupData) {
  return (
    <div>
      <p className="mb-1.5 font-[family-name:var(--font-geist-mono)] text-[8px] font-bold uppercase tracking-widest text-[#D4AF37]">
        {label}
      </p>
      <div className="space-y-1.5">
        {records.map((record, index) => (
          <div
            key={`${record.awardYear}-${record.category}-${record.nominee}-${index}`}
            className="grid grid-cols-[1fr_auto] gap-2 rounded-lg bg-[#09090f] px-2.5 py-2"
          >
            <div className="min-w-0">
              <p className="line-clamp-1 text-xs font-medium text-[#F5F5F0]">
                {record.category}
              </p>
              <p className="line-clamp-1 text-[11px] text-[#888899]">
                {record.nominee || "Nominee not listed"}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="font-[family-name:var(--font-geist-mono)] text-[9px] text-[#555568]">
                {record.awardYear}
              </span>
              <span
                className={cn(
                  "font-[family-name:var(--font-geist-mono)] text-[8px] font-bold uppercase tracking-widest",
                  record.won ? "text-[#D4AF37]" : "text-[#666678]",
                )}
              >
                {record.won ? "Won" : "Nominated"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-[#1e1e2a] bg-[#0d0d1a] px-3 py-2.5">
      <span className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-widest text-[#444458]">
        {label}
      </span>
      <span className="font-[family-name:var(--font-geist-mono)] text-base font-bold text-[#F5F5F0]">
        {value}
      </span>
    </div>
  );
}

function AwardTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[#1e1e2a] px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#888899]">
      {children}
    </span>
  );
}

function ActionBtn({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        "flex h-11 items-center justify-center rounded-xl px-3",
        "border border-[#1e1e2a] text-[#444458]",
        "transition-colors hover:border-[#2a2a3e] hover:text-[#F5F5F0]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// ── Empty state ──────────────────────────────────────────────────────────────

function FilmCardEmpty() {
  return (
    <div className="relative flex h-full flex-1 flex-col overflow-hidden">
      {/* Scanlines */}
      <div
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.025]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg,#F5F5F0,#F5F5F0 1px,transparent 1px,transparent 3px)" }}
      />

      {/* Film strip — top */}
      <div className="flex shrink-0 items-center gap-[5px] border-b border-[#1a1a28] bg-[#060610] px-3 py-[7px]">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="h-[10px] w-[7px] shrink-0 rounded-[2px] bg-[#111120]" />
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
          <div key={i} className="h-[10px] w-[7px] shrink-0 rounded-[2px] bg-[#111120]" />
        ))}
      </div>
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function FilmCardSkeleton() {
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
