"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Clapperboard, Dices, Search, Share2 } from "lucide-react";
import type { FilterState, PaginatedFilms } from "@cineroll/types";
import { FilmCard, FilmCardSkeleton } from "@/components/film-card";
import { FilterBar } from "@/components/filter-bar";
import { AppHeader } from "@/components/app-header";
import { useToast } from "@/components/ui/toast";
import { DEFAULT_FILTERS, useFilters } from "@/hooks/useFilters";
import { fetchAwardYears, fetchCategories, fetchFilms, fetchGenres, fetchRandom, filtersToParams } from "@/lib/api";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 24;

type LoadStatus = "loading" | "success" | "error";

export function BrowsePageClient() {
  const shouldReduceMotion = useReducedMotion();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialFilters = useMemo(
    () => filtersFromSearchParams(searchParams),
    [searchParams],
  );
  const { filters, setFilter, resetFilters, hasActiveFilters } = useFilters(initialFilters);
  const [genres, setGenres] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [awardYears, setAwardYears] = useState<number[]>([]);
  const [result, setResult] = useState<PaginatedFilms | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [isRolling, setIsRolling] = useState(false);
  const lastSyncedQuery = useRef<string | null>(null);

  useEffect(() => {
    void fetchGenres().then(setGenres);
    void fetchCategories().then(setCategories);
    void fetchAwardYears().then(setAwardYears);
  }, []);

  useEffect(() => {
    const urlFilters = filtersFromSearchParams(searchParams);
    const urlQuery = serializeFilters(urlFilters);
    if (lastSyncedQuery.current === urlQuery) return;
    setFilter(urlFilters);
  }, [searchParams, setFilter]);

  useEffect(() => {
    const query = serializeFilters(filters);
    const current = searchParams.toString();
    if (query === current) {
      lastSyncedQuery.current = query;
      return;
    }
    lastSyncedQuery.current = query;
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [filters, pathname, router, searchParams]);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setStatus("loading");
      void fetchFilms(filters, PAGE_SIZE)
        .then((data) => {
          if (!cancelled) { setResult(data); setStatus("success"); }
        })
        .catch(() => {
          if (!cancelled) { setResult(null); setStatus("error"); }
        });
    }, 300);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [filters]);

  const setFilters = useCallback(
    (updates: Partial<FilterState>) => setFilter(updates),
    [setFilter],
  );

  async function handleRoll() {
    setIsRolling(true);
    try {
      const data = await fetchRandom(filters);
      router.push(`/film/${data.film.slug}`);
    } catch {
      setIsRolling(false);
    }
  }

  async function shareFilters() {
    const query = serializeFilters(filters);
    const path = query ? `${pathname}?${query}` : pathname;
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ variant: "success", title: "Link copied!", description: "Current filters are ready to share." });
    } catch {
      toast({ variant: "error", title: "Could not copy link", description: "Copying is not available in this browser." });
    }
  }

  const total = result?.total ?? 0;
  const page = result?.page ?? filters.page;
  const totalPages = Math.max(result?.totalPages ?? 1, 1);
  const showingStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingEnd = result ? Math.min(page * PAGE_SIZE, result.total) : 0;

  return (
    <div className="flex min-h-screen flex-col bg-[#09090f] text-[#F5F5F0]">
      <AppHeader />

      {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
      <div className="border-b border-[#1a1a28] bg-[#09090f]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-3 flex items-center gap-3">
            <span className="text-[#e8453c]">◆</span>
            <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.5em] text-[#606078]">
              CineRoll Archive
            </span>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-tight text-[#F5F5F0] sm:text-5xl">
            Browse Films
          </h1>
          <p className="mt-3 max-w-2xl font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] leading-[1.9] text-[#7070888]">
            Search &amp; filter by title · people · award body · ceremony year · category · genre · decade
          </p>
        </div>
      </div>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-0 px-4 sm:px-6 lg:px-8">

        {/* ── FILTER + GRID LAYOUT ─────────────────────────────────── */}
        <section className="grid gap-8 py-8 lg:grid-cols-[300px_1fr] lg:items-start">

          {/* ── LEFT: FILTERS ────────────────────────────────────────── */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-6">
            {/* Search */}
            <div>
              <span className="mb-1.5 block font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.45em] text-[#9090a8]">
                Film Title
              </span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#555568] pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. Casablanca"
                  value={filters.search}
                  onChange={(e) => setFilters({ search: e.target.value, page: 1 })}
                  className={cn(
                    "h-10 w-full border border-[#1e1e30] bg-[#0d0d1a] pl-9 pr-3 rounded-none",
                    "font-[family-name:var(--font-geist-mono)] text-[11px] text-[#F5F5F0] placeholder:text-[#404058]",
                    "outline-none focus:border-[#e8453c]/60 focus:ring-1 focus:ring-[#e8453c]/25 transition-colors",
                  )}
                />
              </div>
            </div>
            <FilterBar
              filters={filters}
              genres={genres}
              categories={categories}
              awardYears={awardYears}
              onFiltersChange={setFilters}
              onClearFilters={resetFilters}
            />
          </div>

          {/* ── RIGHT: RESULTS ───────────────────────────────────────── */}
          <div className="flex min-w-0 flex-col gap-5">

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1a1a28] pb-4">
              <div className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.25em]">
                {status === "loading" && <span className="text-[#555568]">Loading…</span>}
                {status === "error"   && <span className="text-[#e8453c]/70">Could not load films</span>}
                {status === "success" && (
                  <span className="text-[#9090a8]">
                    <span className="text-[#e0e0f0] font-semibold">{total.toLocaleString()}</span>
                    {" "}{total === 1 ? "film" : "films"} match your filters
                    {total > 0 && (
                      <span className="ml-3 text-[#555568]">
                        ({showingStart}–{showingEnd})
                      </span>
                    )}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void shareFilters()}
                  className="flex h-9 items-center gap-2 border border-[#25253a] bg-transparent px-4 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.25em] text-[#9090a8] transition-colors hover:border-[#e8453c]/40 hover:text-[#e0e0f0] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#e8453c]"
                >
                  <Share2 className="h-3.5 w-3.5" aria-hidden />
                  Share filters
                </button>
                {hasActiveFilters && status === "success" && (
                  <button
                    type="button"
                    disabled={total === 0 || isRolling}
                    onClick={() => void handleRoll()}
                    className="flex h-9 items-center gap-2 bg-[#e8453c] px-4 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.25em] text-white shadow-lg shadow-[#e8453c]/20 transition-all hover:bg-[#d5342b] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
                  >
                    <Dices className={cn("h-3.5 w-3.5", isRolling && "motion-safe:animate-spin")} aria-hidden />
                    {isRolling ? "Rolling…" : total === 0 ? "No matches" : `Roll from ${total.toLocaleString()}`}
                  </button>
                )}
              </div>
            </div>

            {/* States */}
            {status === "loading" && <BrowseSkeleton />}

            {status === "error" && (
              <div className="flex min-h-72 flex-col items-center justify-center gap-4 border border-[#1e1e30] bg-[#0a0a10] px-6 py-12 text-center">
                <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.3em] text-[#9090a8]">
                  Something went wrong
                </p>
                <button
                  type="button"
                  onClick={() => setFilter({ ...filters })}
                  className="border border-[#25253a] px-4 py-2 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.3em] text-[#9090a8] transition-colors hover:border-[#e8453c]/40 hover:text-[#e0e0f0]"
                >
                  Try again
                </button>
              </div>
            )}

            {status === "success" && result && result.films.length === 0 && (
              <div className="flex min-h-72 flex-col items-center justify-center gap-4 border border-dashed border-[#1e1e30] bg-[#0a0a10] px-6 py-12 text-center">
                <Clapperboard className="h-8 w-8 text-[#2a2a42]" aria-hidden />
                <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.3em] text-[#666680]">
                  No films match — try adjusting your filters
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.3em] text-[#e8453c]/70 transition-colors hover:text-[#e8453c]"
                >
                  Reset filters
                </button>
              </div>
            )}

            {status === "success" && result && result.films.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {result.films.map((film, index) => (
                    <motion.div
                      key={film.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        delay: shouldReduceMotion ? 0 : index * 0.04,
                        duration: shouldReduceMotion ? 0 : 0.2,
                        ease: "easeOut",
                      }}
                    >
                      <FilmCard film={film} />
                    </motion.div>
                  ))}
                </div>
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={(nextPage) => setFilters({ page: nextPage })}
                />
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function BrowseSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {Array.from({ length: 12 }).map((_, index) => (
        <FilmCardSkeleton key={index} />
      ))}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <nav
      aria-label="Browse pagination"
      className="flex items-center justify-between border-t border-[#1a1a28] pt-6"
    >
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="flex items-center gap-2 border border-[#25253a] px-5 py-2.5 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.3em] text-[#9090a8] transition-colors hover:border-[#e8453c]/40 hover:text-[#e0e0f0] disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#e8453c]"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
        Prev
      </button>

      <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.3em] text-[#555568]">
        <span className="text-[#c0c0d8]">{page.toLocaleString()}</span>
        {" / "}
        <span className="text-[#c0c0d8]">{totalPages.toLocaleString()}</span>
      </p>

      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="flex items-center gap-2 border border-[#25253a] px-5 py-2.5 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.3em] text-[#9090a8] transition-colors hover:border-[#e8453c]/40 hover:text-[#e0e0f0] disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#e8453c]"
      >
        Next
        <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </button>
    </nav>
  );
}

function filtersFromSearchParams(params: URLSearchParams): FilterState {
  const awardBody = params.get("awardBody");
  const awardYear = numberParam(params.get("awardYear"));
  const decadeMin = numberParam(params.get("decadeMin"));
  const decadeMax = numberParam(params.get("decadeMax"));
  const imdbRatingMin = numberParam(params.get("imdbRatingMin"));
  const runtimeMax = numberParam(params.get("runtimeMax"));
  const nominationCount = numberParam(params.get("nominationCount"));
  const rtScoreMin = numberParam(params.get("rtScoreMin"));
  const page = numberParam(params.get("page"));

  return {
    ...DEFAULT_FILTERS,
    search: params.get("search") ?? "",
    person: params.get("person") ?? "",
    director: params.get("director") ?? "",
    femaleDirectorOnly: params.get("femaleDirectorOnly") === "true",
    awardBody:
      awardBody === "oscar" || awardBody === "goldenglobe" || awardBody === "cannes" || awardBody === "all"
        ? awardBody
        : DEFAULT_FILTERS.awardBody,
    winnerOnly: params.get("winnerOnly") === "true",
    nominatedOnly: params.get("nominatedOnly") === "true",
    category: params.get("category") ?? "",
    awardYear,
    genre: params.get("genre") ?? "",
    contentType: params.get("contentType") ?? "",
    runtimeMax,
    decadeMin: decadeMin ?? DEFAULT_FILTERS.decadeMin,
    decadeMax: decadeMax ?? DEFAULT_FILTERS.decadeMax,
    nominationCount,
    imdbRatingMin: imdbRatingMin ?? DEFAULT_FILTERS.imdbRatingMin,
    imdbRatingMax: numberParam(params.get("imdbRatingMax")),
    rtScoreMin: rtScoreMin ?? DEFAULT_FILTERS.rtScoreMin,
    certificate: params.get("certificate") ?? "",
    imdbTopMoviesOnly: params.get("imdbTopMoviesOnly") === "true",
    imdbTopTvOnly: params.get("imdbTopTvOnly") === "true",
    tvType: params.get("tvType") ?? "",
    page: page && page > 0 ? page : DEFAULT_FILTERS.page,
  };
}

function serializeFilters(filters: FilterState): string {
  const params = filtersToParams(filters);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.toString();
}

function numberParam(value: string | null): number | null {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
