"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clapperboard, RefreshCw, Share2, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { AppHeader } from "@/components/app-header";
import { FilterBar } from "@/components/filter-bar";
import { useFilters } from "@/hooks/useFilters";
import {
  fetchMarathon,
  fetchGenres,
  fetchCategories,
  fetchAwardYears,
  filtersToParams,
  type RollFilm,
} from "@/lib/api";
import { cn } from "@/lib/utils";

function formatRuntime(minutes: number | null): string {
  if (!minutes) return "";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatTotalRuntime(minutes: number): string {
  if (minutes === 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const ORDINALS = ["Film 1", "Film 2", "Film 3", "Film 4", "Film 5"] as const;

interface MarathonFilmCardProps {
  film: RollFilm;
  index: number;
  reduced: boolean;
}

function MarathonFilmCard({ film, index, reduced }: MarathonFilmCardProps) {
  const imageUrl = film.posterUrl ?? film.backdropUrl;
  const runtime = formatRuntime(film.runtime);
  const genre = film.genres[0] ?? "";
  const totalWins = film.oscarWins + film.ggWins + film.cannesWins;

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 26, delay: index * 0.08 }}
      className="flex flex-col overflow-hidden rounded-2xl border border-[#1e1e2a] bg-[#0d0d1a]"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#07070d]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={film.title}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 1280px) 33vw, 280px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#1a1a28]">
            <Clapperboard className="h-10 w-10 text-[#2a2a3e]" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0d0d1a]/80 via-transparent to-transparent" />

        <div className="absolute left-2 top-2 rounded-full border border-[#e8453c]/40 bg-[#e8453c]/20 px-2.5 py-1 font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-[0.18em] text-[#e8453c]">
          {ORDINALS[index] ?? `Film ${index + 1}`}
        </div>

        {totalWins > 0 && (
          <div className="absolute right-2 top-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/15 px-2 py-0.5 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-widest text-[#D4AF37]">
            {totalWins === 1 ? "1 Win" : `${totalWins} Wins`}
          </div>
        )}

        {film.imdbRating != null && (
          <div className="absolute bottom-2 right-2 rounded-md border border-[#F5F5F0]/10 bg-[#09090f]/80 px-1.5 py-0.5 font-[family-name:var(--font-geist-mono)] text-[8px] text-[#F5F5F0]/70 backdrop-blur-sm">
            ★ {film.imdbRating.toFixed(1)}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.16em] text-[#b6b6c8]">
          {film.year}
          {genre ? ` · ${genre}` : ""}
          {runtime ? ` · ${runtime}` : ""}
        </p>
        <h3 className="line-clamp-2 font-[family-name:var(--font-display)] text-sm font-bold leading-tight text-[#F5F5F0]">
          {film.title}
        </h3>
        {film.director && (
          <p className="truncate font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.1em] text-[#555568]">
            Dir. {film.director}
          </p>
        )}
        <Link
          href={`/film/${film.slug}`}
          className="mt-auto pt-2 font-[family-name:var(--font-geist-mono)] text-[9px] font-bold uppercase tracking-[0.18em] text-[#e8453c] transition-colors hover:text-[#ff6b62]"
        >
          View Details →
        </Link>
      </div>
    </motion.div>
  );
}

type Phase = "idle" | "loading" | "results" | "error";

export default function MarathonPage() {
  const reduced = useReducedMotion() ?? false;
  const { filters, setFilter, resetFilters } = useFilters();

  const [phase, setPhase] = useState<Phase>("idle");
  const [films, setFilms] = useState<RollFilm[]>([]);
  const [totalRuntime, setTotalRuntime] = useState(0);
  const [matchTotal, setMatchTotal] = useState(0);
  const [shareStatus, setShareStatus] = useState<"idle" | "copied">("idle");
  const [filterOpen, setFilterOpen] = useState(false);
  const [genres, setGenres] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [awardYears, setAwardYears] = useState<number[]>([]);

  useEffect(() => {
    void Promise.all([fetchGenres(), fetchCategories(), fetchAwardYears()]).then(
      ([g, c, y]) => {
        setGenres(g);
        setCategories(c);
        setAwardYears(y);
      },
    );
  }, []);

  const planNight = useCallback(async () => {
    setPhase("loading");
    try {
      const { films: result, totalRuntime: rt, total } = await fetchMarathon(filters, 3);
      setFilms(result);
      setTotalRuntime(rt);
      setMatchTotal(total);
      setPhase("results");
    } catch {
      setPhase("error");
    }
  }, [filters]);

  async function handleShare() {
    const params = filtersToParams(filters);
    if (films.length > 0) {
      params.set("films", films.map((f) => f.slug).join(","));
    }
    const qs = params.toString();
    const url = `${window.location.origin}/marathon${qs ? `?${qs}` : ""}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus("copied");
      setTimeout(() => setShareStatus("idle"), 2000);
    } catch {
      // clipboard blocked — no-op
    }
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[#09090f]">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-screen-xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-start lg:gap-10 xl:px-12">
        {/* Sidebar */}
        <aside className="flex w-full flex-col gap-5 lg:sticky lg:top-24 lg:w-80 xl:w-96">
          <div className="flex flex-col gap-1">
            <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.35em] text-[#555568]">
              Marathon Planner
            </span>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#F5F5F0] sm:text-3xl">
              Plan Your Movie Night
            </h1>
            <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest text-[#666680]">
              Pick a theme. We pick the lineup.
            </p>
          </div>

          {/* Mobile filter toggle */}
          <button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            className="flex items-center gap-2 self-start rounded-full border border-[#25253a] px-4 py-2 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest text-[#9090a8] transition-colors hover:border-[#e8453c]/40 hover:text-[#F5F5F0] lg:hidden"
          >
            {filterOpen ? (
              <>
                <X className="h-3 w-3" aria-hidden />
                Hide Filters
              </>
            ) : (
              <>
                <SlidersHorizontal className="h-3 w-3" aria-hidden />
                Set Theme
              </>
            )}
          </button>

          <div className={cn("hidden flex-col gap-4 lg:flex", filterOpen && "flex")}>
            <FilterBar
              filters={filters}
              genres={genres}
              categories={categories}
              awardYears={awardYears}
              onFiltersChange={setFilter}
              onClearFilters={resetFilters}
            />
          </div>

          <button
            type="button"
            onClick={() => void planNight()}
            disabled={phase === "loading"}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#e8453c] px-6 py-4 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {phase === "loading" ? (
              <>
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#F5F5F0]/30 border-t-[#F5F5F0]" />
                Building Lineup…
              </>
            ) : (
              "Plan My Night"
            )}
          </button>
        </aside>

        {/* Results */}
        <section className="flex flex-1 flex-col gap-6" aria-live="polite" aria-atomic="true">
          {phase === "idle" && (
            <div className="flex flex-1 flex-col items-center justify-center py-24 text-center">
              <div className="rounded-2xl border border-[#1e1e2a] bg-[#0d0d1a] px-8 py-10">
                <p className="font-[family-name:var(--font-display)] text-lg font-bold text-[#F5F5F0]">
                  Your lineup will appear here
                </p>
                <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest text-[#555568]">
                  Set a theme and hit &ldquo;Plan My Night&rdquo;
                </p>
              </div>
            </div>
          )}

          {phase === "loading" && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 py-24">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#e8453c]/30 border-t-[#e8453c]" />
              <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#555568]">
                Building your lineup…
              </p>
            </div>
          )}

          {phase === "error" && (
            <div className="flex flex-1 flex-col items-center justify-center gap-6 py-24 text-center">
              <p className="font-[family-name:var(--font-geist-mono)] text-sm text-[#888899]">
                Couldn&apos;t load films. Please try again.
              </p>
              <button
                type="button"
                onClick={() => void planNight()}
                className="flex items-center gap-2 rounded-xl bg-[#e8453c] px-6 py-3 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:bg-[#d5342b]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Try Again
              </button>
            </div>
          )}

          {phase === "results" && (
            <AnimatePresence mode="wait">
              <motion.div
                key={films.map((f) => f.id).join(",")}
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-6"
              >
                {films.length < 3 && (
                  <div className="rounded-xl border border-[#D4AF37]/25 bg-[#D4AF37]/5 px-4 py-3">
                    <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#D4AF37]">
                      Only {films.length} film{films.length === 1 ? "" : "s"} matched your theme
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {films.map((film, i) => (
                    <MarathonFilmCard
                      key={film.id}
                      film={film}
                      index={i}
                      reduced={reduced}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between gap-4 rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] px-5 py-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.2em] text-[#555568]">
                      Total Runtime
                    </span>
                    <span className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#F5F5F0]">
                      {formatTotalRuntime(totalRuntime)}
                    </span>
                  </div>
                  <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#444458]">
                    {matchTotal.toLocaleString()} films matched
                  </span>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => void planNight()}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] py-3.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:border-[#2a2a3e]"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Shuffle
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleShare()}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#1e1e2a] bg-[#0d0d1a] py-3.5 font-[family-name:var(--font-geist-mono)] text-[11px] font-bold uppercase tracking-[0.2em] text-[#F5F5F0] transition-colors hover:border-[#2a2a3e]"
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    {shareStatus === "copied" ? "Copied!" : "Share Marathon"}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </section>
      </main>
    </div>
  );
}
