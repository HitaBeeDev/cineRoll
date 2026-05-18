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
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

type LoadStatus = "loading" | "success" | "error";

export function BrowsePageClient() {
  const shouldReduceMotion = useReducedMotion();
  const { toast } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialFilters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams]);
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
    if (query === current) { lastSyncedQuery.current = query; return; }
    lastSyncedQuery.current = query;
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [filters, pathname, router, searchParams]);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setStatus("loading");
      void fetchFilms(filters, PAGE_SIZE)
        .then((data) => { if (!cancelled) { setResult(data); setStatus("success"); } })
        .catch(() => { if (!cancelled) { setResult(null); setStatus("error"); } });
    }, 300);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [filters]);

  const setFilters = useCallback((updates: Partial<FilterState>) => setFilter(updates), [setFilter]);

  async function handleRoll() {
    setIsRolling(true);
    try {
      const data = await fetchRandom(filters);
      router.push(`/film/${data.film.slug}`);
    } catch { setIsRolling(false); }
  }

  async function shareFilters() {
    const query = serializeFilters(filters);
    const url = `${window.location.origin}${query ? `${pathname}?${query}` : pathname}`;
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

      {/* ── CINEMATIC HEADER ──────────────────────────────────────────── */}
      <header className="relative overflow-hidden border-b border-[#141420]">
        {/* Film grain */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: GRAIN_SVG, backgroundSize: "256px 256px" }}
        />
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 55% 100% at 100% 50%, #D4AF3709, transparent 70%)" }}
        />

        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-8 py-14">
            {/* Left: title block */}
            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="h-px w-7 bg-[#e8453c]" />
                <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.55em] text-[#505068]">
                  The Archive
                </span>
              </div>
              <h1
                className="font-[family-name:var(--font-display)] font-bold leading-[0.88] tracking-tight text-[#F5F5F0]"
                style={{ fontSize: "clamp(3rem,7.5vw,6.5rem)" }}
              >
                Browse<br />Films
              </h1>
              <p className="mt-5 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.38em] text-[#444460]">
                Oscar · Golden Globe · Cannes · 1929–Today
              </p>
            </div>

            {/* Right: ghost stat */}
            <div className="hidden shrink-0 pb-1 text-right lg:block">
              <div
                className="font-[family-name:var(--font-display)] font-bold leading-none tabular-nums"
                style={{ fontSize: "clamp(3.5rem,6vw,5.5rem)", color: "#141422" }}
              >
                8,500+
              </div>
              <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.55em] text-[#222234]">
                Films
              </p>
            </div>
          </div>
        </div>

        {/* Red accent separator */}
        <div
          className="h-px w-full"
          style={{ background: "linear-gradient(to right, #e8453c55, #e8453c22, transparent 70%)" }}
        />
      </header>

      {/* ── MAIN ──────────────────────────────────────────────────────── */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 sm:px-6 lg:px-8">
        <section className="grid w-full py-8 lg:grid-cols-[264px_1fr] lg:gap-10 lg:items-start">

          {/* ── SIDEBAR ──────────────────────────────────────────────── */}
          <aside className="flex flex-col gap-0 lg:sticky lg:top-6 lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto">
            <div className="border border-[#161624] bg-[#0b0b14]">
              {/* Search */}
              <div className="border-b border-[#161624] p-4">
                <p className="mb-2.5 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.5em] text-[#505068]">
                  Search
                </p>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#353550]" />
                  <input
                    type="text"
                    placeholder="e.g. Casablanca, Kubrick…"
                    value={filters.search}
                    onChange={(e) => setFilters({ search: e.target.value, page: 1 })}
                    className={cn(
                      "h-9 w-full border border-[#1e1e30] bg-[#09090f] pl-9 pr-3",
                      "font-[family-name:var(--font-geist-mono)] text-[11px] text-[#F5F5F0] placeholder:text-[#303048]",
                      "outline-none focus:border-[#e8453c]/50 focus:ring-1 focus:ring-[#e8453c]/20 transition-colors",
                    )}
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="p-4">
                <FilterBar
                  filters={filters}
                  genres={genres}
                  categories={categories}
                  awardYears={awardYears}
                  onFiltersChange={setFilters}
                  onClearFilters={resetFilters}
                />
              </div>
            </div>
          </aside>

          {/* ── RESULTS ──────────────────────────────────────────────── */}
          <div className="flex min-w-0 flex-col gap-6">

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#141420] pb-4">
              <div className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.22em]">
                {status === "loading" && <span className="text-[#404058]">Loading…</span>}
                {status === "error"   && <span className="text-[#e8453c]/60">Could not load films</span>}
                {status === "success" && (
                  <span className="text-[#8080a0]">
                    <span className="text-[#e0e0f0] font-semibold">{total.toLocaleString()}</span>{" "}
                    {total === 1 ? "film" : "films"}
                    {total > 0 && (
                      <span className="ml-2 text-[#404058]">
                        · {showingStart}–{showingEnd}
                      </span>
                    )}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void shareFilters()}
                  className="flex h-8 items-center gap-2 border border-[#1e1e30] bg-transparent px-4 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.25em] text-[#8080a0] transition-colors hover:border-[#e8453c]/40 hover:text-[#e0e0f0] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#e8453c]"
                >
                  <Share2 className="h-3 w-3" aria-hidden />
                  Share
                </button>
                {hasActiveFilters && status === "success" && (
                  <button
                    type="button"
                    disabled={total === 0 || isRolling}
                    onClick={() => void handleRoll()}
                    className="flex h-8 items-center gap-2 bg-[#e8453c] px-4 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.25em] text-white shadow-md shadow-[#e8453c]/20 transition-all hover:bg-[#d5342b] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]"
                  >
                    <Dices className={cn("h-3 w-3", isRolling && "motion-safe:animate-spin")} aria-hidden />
                    {isRolling ? "Rolling…" : `Roll · ${total.toLocaleString()}`}
                  </button>
                )}
              </div>
            </div>

            {/* Loading */}
            {status === "loading" && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 12 }).map((_, i) => <FilmCardSkeleton key={i} />)}
              </div>
            )}

            {/* Error */}
            {status === "error" && (
              <div className="flex min-h-64 flex-col items-center justify-center gap-4 border border-[#1e1e30] bg-[#0b0b14] px-6 py-12 text-center">
                <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.35em] text-[#8080a0]">
                  Something went wrong
                </p>
                <button
                  type="button"
                  onClick={() => setFilter({ ...filters })}
                  className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.35em] text-[#e8453c]/70 transition-colors hover:text-[#e8453c]"
                >
                  Try again →
                </button>
              </div>
            )}

            {/* Empty */}
            {status === "success" && result && result.films.length === 0 && (
              <div className="flex min-h-64 flex-col items-center justify-center gap-4 border border-dashed border-[#1e1e30] bg-[#0b0b14] px-6 py-12 text-center">
                <Clapperboard className="h-8 w-8 text-[#222238]" aria-hidden />
                <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.35em] text-[#555570]">
                  No films match — try adjusting your filters
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.35em] text-[#e8453c]/70 transition-colors hover:text-[#e8453c]"
                >
                  Reset filters →
                </button>
              </div>
            )}

            {/* Grid */}
            {status === "success" && result && result.films.length > 0 && (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                  {result.films.map((film, index) => (
                    <motion.div
                      key={film.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        delay: shouldReduceMotion ? 0 : index * 0.03,
                        duration: shouldReduceMotion ? 0 : 0.18,
                        ease: "easeOut",
                      }}
                    >
                      <FilmCard film={film} />
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                <nav
                  aria-label="Browse pagination"
                  className="flex items-center justify-between border-t border-[#141420] pt-6"
                >
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setFilters({ page: page - 1 })}
                    className="flex items-center gap-2 border border-[#1e1e30] px-5 py-2.5 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.3em] text-[#8080a0] transition-colors hover:border-[#e8453c]/40 hover:text-[#e0e0f0] disabled:opacity-25 disabled:cursor-not-allowed focus-visible:outline-none"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                    Prev
                  </button>

                  <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.35em] text-[#404058]">
                    <span className="text-[#c0c0d8]">{page.toLocaleString()}</span>
                    {" / "}
                    <span className="text-[#c0c0d8]">{totalPages.toLocaleString()}</span>
                  </p>

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setFilters({ page: page + 1 })}
                    className="flex items-center gap-2 border border-[#1e1e30] px-5 py-2.5 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.3em] text-[#8080a0] transition-colors hover:border-[#e8453c]/40 hover:text-[#e0e0f0] disabled:opacity-25 disabled:cursor-not-allowed focus-visible:outline-none"
                  >
                    Next
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </nav>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
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
        ? awardBody : DEFAULT_FILTERS.awardBody,
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
