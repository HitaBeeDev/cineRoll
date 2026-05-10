"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Clapperboard, Dices, Search, Share2 } from "lucide-react";
import type { FilterState, PaginatedFilms } from "@cineroll/types";
import { Button } from "@/components/ui/button";
import { FilmCard, FilmCardSkeleton } from "@/components/film-card";
import { FilterBar } from "@/components/filter-bar";
import { AppHeader } from "@/components/app-header";
import { Input } from "@/components/ui/input";
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
          if (!cancelled) {
            setResult(data);
            setStatus("success");
          }
        })
        .catch(() => {
          if (!cancelled) {
            setResult(null);
            setStatus("error");
          }
        });
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
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
      toast({
        variant: "success",
        title: "Link copied!",
        description: "Current filters are ready to share.",
      });
    } catch {
      toast({
        variant: "error",
        title: "Could not copy link",
        description: "Copying is not available in this browser.",
      });
    }
  }

  const total = result?.total ?? 0;
  const page = result?.page ?? filters.page;
  const totalPages = Math.max(result?.totalPages ?? 1, 1);
  const showingStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const showingEnd = result ? Math.min(page * PAGE_SIZE, result.total) : 0;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <AppHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="flex flex-col gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
            Browse Films
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-zinc-400">
            Search and filter the award dataset by title, people, award body,
            ceremony year, category, genre, and decade.
          </p>
        </section>

        <section className="grid gap-5 lg:grid-cols-[320px_1fr] lg:items-start">
          <div className="flex flex-col gap-4 lg:sticky lg:top-6">
            <Input
              label="Film title"
              placeholder="e.g. Casablanca"
              value={filters.search}
              onChange={(event) =>
                setFilters({ search: event.target.value, page: 1 })
              }
              leftIcon={<Search className="h-4 w-4" />}
            />
            <FilterBar
              filters={filters}
              genres={genres}
              categories={categories}
              awardYears={awardYears}
              onFiltersChange={setFilters}
              onClearFilters={resetFilters}
            />
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-h-5 text-sm text-zinc-400">
                {status === "loading" && "Loading films..."}
                {status === "error" && "Could not load films."}
                {status === "success" &&
                  `${total.toLocaleString()} ${total === 1 ? "film" : "films"} match your filters`}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => void shareFilters()}
                >
                  <Share2 className="h-4 w-4" aria-hidden />
                  Share these filters
                </Button>
                {hasActiveFilters && status === "success" && (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={total === 0 || isRolling}
                    onClick={() => void handleRoll()}
                  >
                    <Dices className={cn("h-4 w-4", isRolling && "motion-safe:animate-spin")} aria-hidden />
                    {isRolling
                      ? "Rolling…"
                      : total === 0
                        ? "No matches"
                        : `Roll from ${total.toLocaleString()} ${total === 1 ? "film" : "films"}`}
                  </Button>
                )}
                {status === "success" && total > 0 && (
                  <p className="text-xs text-zinc-500">
                    Showing {showingStart.toLocaleString()}–
                    {showingEnd.toLocaleString()} of {total.toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            {status === "loading" && <BrowseSkeleton />}

            {status === "error" && (
              <div className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-6 py-12 text-center">
                <p className="text-sm text-zinc-400">Something went wrong loading films.</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setFilter({ ...filters })}
                >
                  Try again
                </Button>
              </div>
            )}

            {status === "success" && result && result.films.length === 0 && (
              <div className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-zinc-800 px-6 py-12 text-center">
                <Clapperboard className="h-8 w-8 text-zinc-700" aria-hidden />
                <p className="text-sm text-zinc-500">No films match — try adjusting your filters</p>
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Reset filters
                </Button>
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
      className="flex flex-col items-center justify-between gap-3 border-t border-zinc-800 pt-5 sm:flex-row"
    >
      <Button
        variant="secondary"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="w-full sm:w-auto"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Previous
      </Button>

      <p className="text-xs text-zinc-500">
        Page <span className="text-zinc-300">{page.toLocaleString()}</span> of{" "}
        <span className="text-zinc-300">{totalPages.toLocaleString()}</span>
      </p>

      <Button
        variant="secondary"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="w-full sm:w-auto"
      >
        Next
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Button>
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
      awardBody === "oscar" ||
      awardBody === "goldenglobe" ||
      awardBody === "cannes" ||
      awardBody === "all"
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
