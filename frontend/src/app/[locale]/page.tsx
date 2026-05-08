"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Share2, Dices } from "lucide-react";
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
  type RollFilm,
} from "@/lib/api";
import { useFilters } from "@/hooks/useFilters";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const { toast } = useToast();
  const { filters, setFilter, resetFilters, hasActiveFilters } = useFilters();
  const [film, setFilm] = useState<RollFilm | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [filteredCount, setFilteredCount] = useState<number | null>(null);
  const [isCountLoading, setIsCountLoading] = useState(false);
  const [genres, setGenres] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [awardYears, setAwardYears] = useState<number[]>([]);

  const handleRollRef = useRef<() => Promise<void>>(async () => {});
  const filmCardRef = useRef<HTMLDivElement>(null);

  // Fetch filter metadata
  useEffect(() => {
    void fetchGenres().then(setGenres);
    void fetchCategories().then(setCategories);
    void fetchAwardYears().then(setAwardYears);
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
            behavior: "smooth",
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

  // Auto-load a film on mount so the card is never empty
  const hasAutoRolled = useRef(false);
  useEffect(() => {
    if (!hasAutoRolled.current) {
      hasAutoRolled.current = true;
      void handleRollRef.current();
    }
    // intentional empty deps — runs once after first render when ref is set
  }, []);

  // Pool count display
  const poolCountStr = effectiveCountLoading
    ? "···"
    : effectiveCount !== null
      ? String(effectiveCount).padStart(3, "0")
      : filteredCount !== null
        ? String(filteredCount).padStart(3, "0")
        : "···";

  return (
    <div className="flex flex-col min-h-screen bg-[#09090f] text-[#F5F5F0]">
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
      <div className="flex flex-1 flex-col lg:flex-row lg:h-[calc(100vh-4rem)] lg:overflow-hidden">
        {/* LEFT: hero + filters + roll ──────────────────────────────── */}
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:w-0 px-5 py-4 sm:px-8 lg:px-10 lg:py-5">
          {/* Channel label */}
          <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.25em] text-[#888899]">
            {"// CHANNEL 03 · TONIGHT"}
          </p>

          {/* Hero headline */}
          <div>
            <h1
              className={cn(
                "font-[family-name:var(--font-display)] font-bold leading-[1.0] tracking-tight",
                "text-[clamp(3.4rem,4.2vw,4.2rem)] text-[#F5F5F0]",
              )}
            >
              One spin.
              <br />
              <span className="text-[#e8453c]">One film.</span>
              <br />
              Tonight.
            </h1>
            <p className="mt-4 max-w-[380px] text-sm leading-relaxed text-[#888899]">
              A jukebox for award cinema. Tune the dials below, then pull the
              lever.
            </p>
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
                  "bg-[#e8453c] text-white",
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
            "lg:w-[480px] xl:w-[520px]",
            "min-h-[400px] lg:min-h-0 lg:overflow-y-auto",
            "p-4",
          )}
        >
          <AnimatePresence mode="wait">
            {isRolling ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <FilmCardSkeleton />
              </motion.div>
            ) : film ? (
              <motion.div
                key={film.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
              >
                <FilmCard film={film} />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
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

// ── Film card ────────────────────────────────────────────────────────────────

function FilmCard({ film }: { film: RollFilm }) {
  const channelLabel = `REEL // ${film.title.toUpperCase().slice(0, 11)}`;
  const genre = film.genres[0] ?? "";
  const runtime =
    film.runtime != null
      ? `${Math.floor(film.runtime / 60)}h ${film.runtime % 60}m`
      : null;
  const imageUrl = film.backdropUrl ?? film.posterUrl;
  const totalWins = film.oscarWins + film.ggWins + film.cannesWins;
  const totalNoms =
    film.oscarNominations + film.ggNominations + film.cannesNominations;

  return (
    <div className="flex flex-col">
      {/* Channel pill */}
      <div className="flex items-center -mx-1 -mt-1 mb-5">
        <span className="inline-flex items-center rounded-full border border-[#e8453c]/22 bg-[#e8453c]/10 px-3 py-1 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#e8453c]">
          {channelLabel}
        </span>
      </div>

      {/* Backdrop / poster image */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
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
        {/* Gradient vignette */}
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
        <div className="flex items-start justify-between gap-3 mt-2">
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
        <div className="grid grid-cols-3 gap-2 mt-3">
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

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-2">
          <Link
            href={`/film/${film.slug}`}
            className={cn(
              "flex flex-1 items-center justify-center rounded-xl py-3",
              "bg-[#e8453c] text-white",
              "font-[family-name:var(--font-geist-mono)] text-[10px] font-bold uppercase tracking-[0.2em]",
              "transition-colors hover:bg-[#d5342b]",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]",
            )}
          >
            Watch Tonight
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
    <div className="flex min-h-[360px] flex-col items-center justify-center gap-5 p-8 text-center">
      <div className="rounded-full border border-[#e8453c]/18 bg-[#e8453c]/8 p-5">
        <Dices className="h-9 w-9 text-[#e8453c]/35" aria-hidden />
      </div>
      <div>
        <p className="mb-2 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.25em] text-[#444458]">
          No Film Loaded
        </p>
        <p className="font-[family-name:var(--font-display)] text-xl text-[#222234]">
          Spin the reel to begin
        </p>
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
