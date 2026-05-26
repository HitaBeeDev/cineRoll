"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Clapperboard,
  Search,
  Shuffle,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { AwardBody, FilterState, PaginatedFilms } from "@cineroll/types";
import { FilmCard, FilmCardSkeleton } from "@/components/film-card";
import { AppHeader } from "@/components/app-header";
import { DEFAULT_FILTERS, useFilters } from "@/hooks/useFilters";
import {
  fetchAwardYears,
  fetchAutocomplete,
  fetchCategories,
  fetchFilms,
  fetchGenres,
  fetchRandom,
  filtersToParams,
  type AutocompleteResult,
} from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 25;
const DECADE_MIN = 1900;
const DECADE_MAX = 2030;
const BROWSE_DECADE_OPTIONS = Array.from({ length: (DECADE_MAX - DECADE_MIN) / 10 + 1 }, (_, i) => DECADE_MIN + i * 10);
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const AWARD_BODIES: { value: AwardBody; label: string }[] = [
  { value: "all",         label: "All"    },
  { value: "oscar",       label: "Oscar"  },
  { value: "goldenglobe", label: "GG"     },
  { value: "cannes",      label: "Cannes" },
];

type LoadStatus = "loading" | "success" | "error";

const SORT_OPTIONS: { value: FilterState["sort"]; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Rating" },
  { value: "awards", label: "Awards" },
  { value: "title", label: "A-Z" },
];

export function BrowsePageClient() {
  const shouldReduceMotion = useReducedMotion();
  const router    = useRouter();
  const pathname  = usePathname();
  const searchParams = useSearchParams();
  const initialFilters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams]);
  const { filters, setFilter, resetFilters, hasActiveFilters } = useFilters(initialFilters);

  const [genres,     setGenres]     = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [awardYears, setAwardYears] = useState<number[]>([]);
  const [result,     setResult]     = useState<PaginatedFilms | null>(null);
  const [status,     setStatus]     = useState<LoadStatus>("loading");
  const [showMore, setShowMore] = useState(false);

  const [rolling, setRolling] = useState(false);

  const [acResults, setAcResults] = useState<AutocompleteResult | null>(null);
  const [acOpen, setAcOpen] = useState(false);
  const [acIdx, setAcIdx] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const lastSyncedQuery = useRef<string | null>(null);

  useEffect(() => {
    void fetchGenres().then(setGenres);
    void fetchCategories().then(setCategories);
    void fetchAwardYears().then(setAwardYears);
  }, []);

  useEffect(() => {
    const urlFilters = filtersFromSearchParams(searchParams);
    const urlQuery   = serializeFilters(urlFilters);
    if (lastSyncedQuery.current === urlQuery) return;
    const t = window.setTimeout(() => setFilter(urlFilters), 0);
    return () => window.clearTimeout(t);
  }, [searchParams, setFilter]);

  useEffect(() => {
    const query   = serializeFilters(filters);
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
        .catch(()    => { if (!cancelled) { setResult(null); setStatus("error");   } });
    }, 300);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [filters]);

  useEffect(() => {
    const q = filters.search.trim();
    if (q.length < 2) { setAcResults(null); setAcOpen(false); return; }
    const timer = window.setTimeout(() => {
      void fetchAutocomplete(q).then((data) => {
        setAcResults(data);
        setAcOpen(data.films.length + data.people.length > 0);
        setAcIdx(-1);
      });
    }, 200);
    return () => window.clearTimeout(timer);
  }, [filters.search]);

  useEffect(() => {
    if (!acOpen) return;
    function handleClick(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setAcOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [acOpen]);

  const setFilters = useCallback(
    (updates: Partial<FilterState>) => setFilter(updates),
    [setFilter],
  );

  const selectAcItem = useCallback((idx: number) => {
    if (!acResults) return;
    if (idx < acResults.films.length) {
      const film = acResults.films[idx];
      if (film) setFilters({ search: film.title, person: "", page: 1 });
    } else {
      const person = acResults.people[idx - acResults.films.length];
      if (person) setFilters({ person: person.name, search: "", page: 1 });
    }
    setAcOpen(false);
    setAcIdx(-1);
  }, [acResults, setFilters]);

  async function handleRollFromResults() {
    if (rolling) return;
    setRolling(true);
    try {
      const { film } = await fetchRandom(filters);
      router.push(`/film/${film.slug}`);
    } finally {
      setRolling(false);
    }
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!acOpen || !acResults) return;
    const total = acResults.films.length + acResults.people.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAcIdx((prev) => (prev + 1) % total);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAcIdx((prev) => (prev <= 0 ? total - 1 : prev - 1));
    } else if (e.key === "Enter" && acIdx >= 0) {
      e.preventDefault();
      selectAcItem(acIdx);
    } else if (e.key === "Escape") {
      setAcOpen(false);
      setAcIdx(-1);
    }
  }

  const total       = result?.total    ?? 0;
  const page        = result?.page     ?? filters.page;
  const totalPages  = Math.max(result?.totalPages ?? 1, 1);
  const showingEnd  = result ? Math.min(page * PAGE_SIZE, result.total) : 0;
  const showingStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;

  const activeChips = buildActiveChips(filters, setFilters);
  const resultContext = buildResultContext(filters);
  const gridClassName = "grid min-w-0 grid-cols-1 gap-x-4 gap-y-8 [&>*]:min-w-0 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6";

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#08080d] text-[#F5F5F0]">
      <AppHeader />

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-[#24202a] bg-[#0a0a10]">
        {/* Grain */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: GRAIN_SVG, backgroundSize: "256px 256px" }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.025), transparent 70%)",
          }}
        />

        <div className="relative mx-auto w-full max-w-[100vw] px-4 sm:max-w-screen-2xl sm:px-6 lg:px-8 xl:px-12">
          <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-end sm:justify-between sm:py-5">
            <div>
              <div className="mb-2.5 h-px w-10 bg-[#e8453c]" />
              <h1
                className="font-[family-name:var(--font-display)] font-bold leading-none tracking-tight text-[#f4f0f7]"
                style={{
                  fontSize: "clamp(1.9rem, 3.6vw, 3.25rem)",
                }}
              >
                Browse Films
              </h1>
              <p className="mt-2 max-w-full text-sm leading-6 text-[#a7a4b8] sm:max-w-xl">
                <span className="sm:hidden">Search award films with fast filters.</span>
                <span className="hidden sm:inline">
                  Search award films, festival discoveries, and ranked favorites with fast filters built for browsing.
                </span>
              </p>
            </div>
            <div className="hidden flex-wrap items-center gap-2 sm:flex sm:justify-end">
              {["Oscar", "Golden Globe", "Cannes", "1929-Today"].map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3.5 py-1.5 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.18em] text-[#b8b5c8]"
                >
                  <span className="h-1 w-1 rounded-full bg-[#e8453c]/70" aria-hidden />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          className="h-px w-full"
          style={{ background: "linear-gradient(to right, #e8453c99 0%, rgba(212,175,55,0.45) 36%, transparent 78%)" }}
        />
      </section>

      {/* ── STICKY FILTER BAR ───────────────────────────────────────────── */}
      <div className="sticky top-14 z-40 max-w-[100vw] border-b border-[#1c1a25] bg-[#08080d]/92 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div className="mx-auto w-full max-w-[100vw] px-4 sm:max-w-screen-2xl sm:px-6 lg:px-8 xl:px-12">

          {/* Primary filter row */}
          <div className="flex flex-wrap items-center gap-2 py-2.5">

            {/* Search */}
            <div ref={searchContainerRef} className="relative w-full min-w-0 sm:max-w-[340px] sm:flex-1 lg:flex-none">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6f6b80]" />
              <input
                type="text"
                placeholder="Title, director, person…"
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value, page: 1 })}
                onKeyDown={handleSearchKeyDown}
                onFocus={() => { if (acResults && acResults.films.length + acResults.people.length > 0) setAcOpen(true); }}
                aria-autocomplete="list"
                aria-expanded={acOpen}
                className="h-10 w-full rounded-md border border-white/10 bg-white/[0.045] pl-9 pr-3 font-[family-name:var(--font-geist-mono)] text-[12px] text-[#f1eff8] outline-none transition-colors placeholder:text-[#6f6a80] hover:border-white/18 focus:border-[#e8453c]/70 focus:ring-2 focus:ring-[#e8453c]/15"
              />
              {acOpen && acResults && (acResults.films.length + acResults.people.length) > 0 && (
                <div
                  role="listbox"
                  className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border border-white/12 bg-[#0e0d18] shadow-[0_16px_48px_rgba(0,0,0,0.6)]"
                >
                  {acResults.films.length > 0 && (
                    <>
                      <div className="px-3 pt-2.5 pb-1 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.28em] text-[#555064]">
                        Films
                      </div>
                      {acResults.films.map((film, i) => (
                        <button
                          key={film.slug}
                          role="option"
                          aria-selected={acIdx === i}
                          type="button"
                          onMouseDown={(e) => { e.preventDefault(); selectAcItem(i); }}
                          onMouseEnter={() => setAcIdx(i)}
                          className={cn(
                            "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors",
                            acIdx === i ? "bg-white/[0.08]" : "hover:bg-white/[0.05]",
                          )}
                        >
                          <Clapperboard className="h-3 w-3 shrink-0 text-[#555064]" aria-hidden />
                          <span className="min-w-0 flex-1 truncate font-[family-name:var(--font-geist-mono)] text-[11px] text-[#e8e5f4]">
                            {film.title}
                          </span>
                          <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[10px] text-[#555064]">
                            {film.year}
                          </span>
                        </button>
                      ))}
                    </>
                  )}
                  {acResults.people.length > 0 && (
                    <>
                      <div className={cn(
                        "px-3 pb-1 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.28em] text-[#555064]",
                        acResults.films.length > 0 ? "mt-2 border-t border-white/[0.06] pt-2.5" : "pt-2.5",
                      )}>
                        People
                      </div>
                      {acResults.people.map((person, j) => {
                        const flatIdx = acResults.films.length + j;
                        return (
                          <button
                            key={person.name}
                            role="option"
                            aria-selected={acIdx === flatIdx}
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); selectAcItem(flatIdx); }}
                            onMouseEnter={() => setAcIdx(flatIdx)}
                            className={cn(
                              "flex w-full items-center gap-3 px-3 py-2 text-left transition-colors",
                              acIdx === flatIdx ? "bg-white/[0.08]" : "hover:bg-white/[0.05]",
                            )}
                          >
                            <Search className="h-3 w-3 shrink-0 text-[#555064]" aria-hidden />
                            <span className="min-w-0 flex-1 truncate font-[family-name:var(--font-geist-mono)] text-[11px] text-[#e8e5f4]">
                              {person.name}
                            </span>
                            <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[9px] capitalize text-[#555064]">
                              {person.roles.join(" · ")}
                            </span>
                          </button>
                        );
                      })}
                    </>
                  )}
                  <div className="h-1" />
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="hidden h-6 w-px bg-white/10 lg:block" />

            {/* Award body */}
            <div className="flex w-full max-w-full items-center gap-1 overflow-x-auto rounded-md border border-white/10 bg-white/[0.025] p-1 sm:w-auto sm:overflow-visible">
              {AWARD_BODIES.map(({ value, label }) => {
                const active =
                  filters.awardBody === value &&
                  !filters.imdbTopMoviesOnly &&
                  !filters.imdbTopTvOnly;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setFilters({ awardBody: value, imdbTopMoviesOnly: false, imdbTopTvOnly: false, page: 1 })
                    }
                    className={cn(
                      "h-8 shrink-0 rounded px-3.5 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.14em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/40",
                      active
                        ? "bg-[#e8453c] text-white shadow-[0_0_24px_rgba(232,69,60,0.24)]"
                        : "text-[#7f7a91] hover:bg-white/[0.055] hover:text-[#f1eff8]",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="hidden h-6 w-px bg-white/10 xl:block" />

            {/* Status */}
            <div className="flex w-full max-w-full items-center gap-1 overflow-x-auto rounded-md border border-white/10 bg-white/[0.025] p-1 sm:w-auto sm:overflow-visible">
              {(
                [
                  { label: "Any",  active: !filters.winnerOnly && !filters.nominatedOnly, fn: () => setFilters({ winnerOnly: false, nominatedOnly: false, page: 1 }) },
                  { label: "Won",  active: filters.winnerOnly,                             fn: () => setFilters({ winnerOnly: true,  nominatedOnly: false, page: 1 }) },
                  { label: "Nom.", active: filters.nominatedOnly && !filters.winnerOnly,   fn: () => setFilters({ winnerOnly: false,  nominatedOnly: true,  page: 1 }) },
                ] as { label: string; active: boolean; fn: () => void }[]
              ).map(({ label, active, fn }) => (
                <button
                  key={label}
                  type="button"
                  onClick={fn}
                  className={cn(
                    "h-8 shrink-0 rounded px-3.5 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.14em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/35",
                    active
                      ? "bg-[#D4AF37] font-semibold text-[#09090f] shadow-[0_0_24px_rgba(212,175,55,0.18)]"
                      : "text-[#7f7a91] hover:bg-white/[0.055] hover:text-[#f1eff8]",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="hidden h-6 w-px bg-white/10 sm:block" />

            {/* Genre */}
            <div className="hidden sm:block">
              <Select
                value={filters.genre || "_all"}
                onValueChange={(val) =>
                  setFilters({ genre: val === "_all" ? "" : val, page: 1 })
                }
              >
                <SelectTrigger className="h-10 w-[158px] rounded-md border-white/10 bg-white/[0.045] font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.14em] text-[#b8b5c8] transition-colors hover:border-white/20 focus:ring-[#e8453c]/60 focus:ring-offset-0">
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#101019]">
                  <SelectItem value="_all">All genres</SelectItem>
                  {genres.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* More filters */}
            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              className={cn(
                "flex h-10 items-center gap-2 rounded-md border px-3.5 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.14em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/40",
                showMore
                  ? "border-[#e8453c]/55 bg-[#e8453c]/12 text-[#ff766d]"
                  : "border-white/10 bg-white/[0.045] text-[#b8b5c8] hover:border-white/20 hover:text-[#f1eff8]",
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
              Filters
              {hasActiveFilters && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#e8453c]" />
              )}
            </button>

            <div className="flex-1" />
          </div>

          {/* Active chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pb-3">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onRemove}
                  aria-label={`Remove ${chip.label} filter`}
                  className="inline-flex h-7 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.045] px-2.5 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.18em] text-[#a9a5bc] transition-colors hover:border-[#e8453c]/45 hover:text-[#ff766d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/30"
                >
                  {chip.label}
                  <X className="h-2.5 w-2.5 shrink-0" aria-hidden />
                </button>
              ))}
              <button
                type="button"
                onClick={() => { resetFilters(); setShowMore(false); }}
                className="ml-1 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.24em] text-[#706b82] transition-colors hover:text-[#ff766d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/30"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* ── EXPANDED FILTER PANEL ─────────────────────────── */}
        {showMore && (
          <div className="border-t border-white/10 bg-[#090910]/98">
            <div className="mx-auto w-full max-w-[100vw] px-4 py-6 sm:max-w-screen-2xl sm:px-6 lg:px-8 xl:px-12">
              <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

                {/* IMDb */}
                <PanelSection label="IMDb Rating">
                  <div className="flex flex-wrap gap-1">
                    {[0, 6, 6.5, 7, 7.5, 8, 8.5, 9].map((r) => (
                      <FilterChip
                        key={r}
                        active={filters.imdbRatingMin === r}
                        onClick={() => setFilters({ imdbRatingMin: r, page: 1 })}
                      >
                        {r === 0 ? "Any" : `${r}+`}
                      </FilterChip>
                    ))}
                  </div>
                </PanelSection>

                {/* RT */}
                <PanelSection label="Rotten Tomatoes">
                  <div className="flex flex-wrap gap-1">
                    {[0, 50, 60, 70, 80, 90, 95].map((s) => (
                      <FilterChip
                        key={s}
                        active={filters.rtScoreMin === s}
                        onClick={() => setFilters({ rtScoreMin: s, page: 1 })}
                      >
                        {s === 0 ? "Any" : `${s}%+`}
                      </FilterChip>
                    ))}
                  </div>
                </PanelSection>

                {/* Type */}
                <PanelSection label="Content Type">
                  <div className="flex flex-wrap gap-1">
                    {(
                      [
                        { value: "",            label: "All"       },
                        { value: "movie",       label: "Movie"     },
                        { value: "short",       label: "Short"     },
                        { value: "animation",   label: "Animation" },
                        { value: "documentary", label: "Doc"       },
                        { value: "tv-series",   label: "TV Series" },
                      ] as { value: string; label: string }[]
                    ).map(({ value, label }) => (
                      <FilterChip
                        key={value}
                        active={filters.contentType === value}
                        onClick={() => setFilters({ contentType: value, page: 1 })}
                      >
                        {label}
                      </FilterChip>
                    ))}
                  </div>
                </PanelSection>

                {/* Lists */}
                <PanelSection label="Curated Lists">
                  <div className="flex flex-wrap gap-1">
                    <FilterChip
                      active={filters.imdbTopMoviesOnly}
                      onClick={() => setFilters({ imdbTopMoviesOnly: !filters.imdbTopMoviesOnly, imdbTopTvOnly: false, page: 1 })}
                    >
                      IMDb Top 250 Films
                    </FilterChip>
                    <FilterChip
                      active={filters.imdbTopTvOnly}
                      onClick={() => setFilters({ imdbTopTvOnly: !filters.imdbTopTvOnly, imdbTopMoviesOnly: false, page: 1 })}
                    >
                      IMDb Top 250 TV
                    </FilterChip>
                  </div>
                </PanelSection>

                {/* Category */}
                <PanelSection label="Award Category">
                  <Select
                    value={filters.category || "_all"}
                    onValueChange={(val) => setFilters({ category: val === "_all" ? "" : val, page: 1 })}
                  >
                    <SelectTrigger className="h-10 w-full rounded-md border-white/10 bg-white/[0.045] font-[family-name:var(--font-geist-mono)] text-[10px] text-[#b8b5c8] transition-colors hover:border-white/20 focus:ring-[#e8453c]/60 focus:ring-offset-0">
                      <SelectValue placeholder="Any category" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-[#101019]">
                      <SelectItem value="_all">Any category</SelectItem>
                      {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </PanelSection>

                {/* Ceremony year */}
                <PanelSection label="Ceremony Year">
                  <Select
                    value={filters.awardYear != null ? String(filters.awardYear) : "_any"}
                    onValueChange={(val) =>
                      setFilters({ awardYear: val === "_any" ? null : Number(val), page: 1 })
                    }
                  >
                    <SelectTrigger className="h-10 w-full rounded-md border-white/10 bg-white/[0.045] font-[family-name:var(--font-geist-mono)] text-[10px] text-[#b8b5c8] transition-colors hover:border-white/20 focus:ring-[#e8453c]/60 focus:ring-offset-0">
                      <SelectValue placeholder="Any year" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-[#101019]">
                      <SelectItem value="_any">Any year</SelectItem>
                      {awardYears.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </PanelSection>

                {/* Decade */}
                <PanelSection label="Decade">
                  <div className="flex gap-2">
                    <Select
                      value={String(filters.decadeMin)}
                      onValueChange={(val) => setFilters({ decadeMin: Number(val), page: 1 })}
                    >
                      <SelectTrigger className="h-10 flex-1 rounded-md border-white/10 bg-white/[0.045] font-[family-name:var(--font-geist-mono)] text-[10px] text-[#b8b5c8] transition-colors hover:border-white/20 focus:ring-[#e8453c]/60 focus:ring-offset-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-white/10 bg-[#101019]">
                        {BROWSE_DECADE_OPTIONS.map((d) => (
                          <SelectItem key={d} value={String(d)}>
                            {d === DECADE_MIN ? "Any" : `${d}s`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={String(filters.decadeMax)}
                      onValueChange={(val) => setFilters({ decadeMax: Number(val), page: 1 })}
                    >
                      <SelectTrigger className="h-10 flex-1 rounded-md border-white/10 bg-white/[0.045] font-[family-name:var(--font-geist-mono)] text-[10px] text-[#b8b5c8] transition-colors hover:border-white/20 focus:ring-[#e8453c]/60 focus:ring-offset-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-white/10 bg-[#101019]">
                        {BROWSE_DECADE_OPTIONS.map((d) => (
                          <SelectItem key={d} value={String(d)}>
                            {d === DECADE_MAX ? "Any" : `${d}s`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </PanelSection>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MAIN GRID ───────────────────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-[100vw] flex-1 px-4 py-6 sm:max-w-screen-2xl sm:px-6 sm:py-8 lg:px-8 xl:px-12">
        <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.22em] text-[#e8453c]">
              {resultContext}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-normal text-[#f2eff8] sm:text-2xl">
              {status === "success" && total > 0
                ? `${total.toLocaleString()} films`
                : status === "loading"
                  ? "Loading films"
                  : "Browse results"}
            </h2>
            {status === "success" && total > 0 && (
              <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-[#817c91]">
                Showing {showingStart.toLocaleString()}-{showingEnd.toLocaleString()} of {total.toLocaleString()}
              </p>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              disabled={rolling || status === "loading" || total === 0}
              onClick={() => { void handleRollFromResults(); }}
              className="flex shrink-0 items-center gap-2 rounded-lg border border-[#e8453c]/40 bg-[#e8453c]/10 px-4 py-2.5 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.16em] text-[#ff766d] transition-all hover:border-[#e8453c]/70 hover:bg-[#e8453c]/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Shuffle className={cn("h-3.5 w-3.5", rolling && "animate-spin")} aria-hidden />
              {rolling ? "Rolling…" : total === 0 && status === "success" ? "No matches" : status === "success" ? `Roll from ${total.toLocaleString()} films` : "Roll from these results"}
            </button>
          )}

          <div className="flex w-full flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.025] p-2 shadow-[0_18px_50px_rgba(0,0,0,0.22)] lg:w-auto">
            <span className="px-2 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.18em] text-[#7d788e]">
              Sort
            </span>
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={filters.sort === option.value}
                onClick={() => setFilters({ sort: option.value, page: 1 })}
                className={cn(
                  "h-9 rounded-lg px-3 font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.13em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/35",
                  filters.sort === option.value
                    ? "bg-[#e8453c] text-white shadow-[0_10px_24px_rgba(232,69,60,0.22)]"
                    : "bg-[#111018] text-[#a9a5bc] hover:bg-white/[0.075] hover:text-white",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {status === "loading" && (
          <div className={gridClassName}>
            {Array.from({ length: 18 }).map((_, i) => <FilmCardSkeleton key={i} />)}
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="flex min-h-80 flex-col items-center justify-center gap-5 rounded-lg border border-dashed border-white/12 bg-white/[0.025] px-6 py-16 text-center">
            <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.32em] text-[#8e899e]">
              Something went wrong
            </p>
            <button
              type="button"
              onClick={() => setFilter({ ...filters })}
              className="rounded-full border border-[#e8453c]/35 px-4 py-2 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.24em] text-[#ff766d] transition-colors hover:border-[#e8453c]/70 hover:text-white"
            >
              Try again →
            </button>
          </div>
        )}

        {/* Empty */}
        {status === "success" && result?.films.length === 0 && (
          <div className="flex min-h-80 flex-col items-center justify-center gap-5 rounded-lg border border-dashed border-white/12 bg-white/[0.025] px-6 py-16 text-center">
            <Clapperboard className="h-10 w-10 text-[#555064]" aria-hidden />
            <p className="font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.28em] text-[#8e899e]">
              No films match — try adjusting your filters
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-full border border-[#e8453c]/35 px-4 py-2 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.24em] text-[#ff766d] transition-colors hover:border-[#e8453c]/70 hover:text-white"
            >
              Reset filters →
            </button>
          </div>
        )}

        {/* Grid */}
        {status === "success" && result && result.films.length > 0 && (
          <>
            <div className={gridClassName}>
              {result.films.map((film, index) => (
                <motion.div
                  key={film.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: shouldReduceMotion ? 0 : Math.min(index * 0.025, 0.4),
                    duration: shouldReduceMotion ? 0 : 0.22,
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
              className="mt-14 flex items-center justify-between border-t border-white/10 pt-6"
            >
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setFilters({ page: page - 1 })}
                className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.035] px-5 py-2.5 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.22em] text-[#a9a5bc] transition-colors hover:border-[#e8453c]/35 hover:text-white disabled:cursor-not-allowed disabled:opacity-25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/30"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                Prev
              </button>

              <p className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.22em] text-[#686378]">
                <span className="text-[#dedbea]">{page.toLocaleString()}</span>
                <span className="mx-1.5 text-[#575266]">/</span>
                <span className="text-[#dedbea]">{totalPages.toLocaleString()}</span>
              </p>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setFilters({ page: page + 1 })}
                className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.035] px-5 py-2.5 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.22em] text-[#a9a5bc] transition-colors hover:border-[#e8453c]/35 hover:text-white disabled:cursor-not-allowed disabled:opacity-25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/30"
              >
                Next
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </button>
            </nav>
          </>
        )}
      </main>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────────────────────────── */

function PanelSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.3em] text-[#8e899e]">
        {label}
      </span>
      {children}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-8 rounded-md border px-3 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.16em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/35",
        active
          ? "border-[#e8453c] bg-[#e8453c] text-white"
          : "border-white/10 bg-white/[0.035] text-[#a9a5bc] hover:border-white/20 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────── */

type ActiveChip = { key: string; label: string; onRemove: () => void };

function buildActiveChips(
  filters: FilterState,
  setFilters: (u: Partial<FilterState>) => void,
): ActiveChip[] {
  const chips: ActiveChip[] = [];

  if (filters.search.trim())
    chips.push({ key: "search", label: `"${filters.search.trim()}"`, onRemove: () => setFilters({ search: "", page: 1 }) });
  if (filters.person.trim())
    chips.push({ key: "person", label: filters.person.trim(), onRemove: () => setFilters({ person: "", page: 1 }) });
  if (filters.femaleDirectorOnly)
    chips.push({ key: "femaleDir", label: "Female director", onRemove: () => setFilters({ femaleDirectorOnly: false, page: 1 }) });
  if (filters.awardBody !== "all")
    chips.push({ key: "body", label: filters.awardBody, onRemove: () => setFilters({ awardBody: "all", page: 1 }) });
  if (filters.winnerOnly)
    chips.push({ key: "won", label: "Won", onRemove: () => setFilters({ winnerOnly: false, page: 1 }) });
  else if (filters.nominatedOnly)
    chips.push({ key: "nom", label: "Nominated", onRemove: () => setFilters({ nominatedOnly: false, page: 1 }) });
  if (filters.genre.trim())
    chips.push({ key: "genre", label: filters.genre, onRemove: () => setFilters({ genre: "", page: 1 }) });
  if (filters.category.trim())
    chips.push({ key: "cat", label: filters.category, onRemove: () => setFilters({ category: "", page: 1 }) });
  if (filters.awardYear != null)
    chips.push({ key: "year", label: String(filters.awardYear), onRemove: () => setFilters({ awardYear: null, page: 1 }) });
  if (filters.contentType)
    chips.push({ key: "type", label: filters.contentType, onRemove: () => setFilters({ contentType: "", page: 1 }) });
  if (filters.imdbTopMoviesOnly)
    chips.push({ key: "imdbMovies", label: "IMDb Top 250 Films", onRemove: () => setFilters({ imdbTopMoviesOnly: false, page: 1 }) });
  if (filters.imdbTopTvOnly)
    chips.push({ key: "imdbTv", label: "IMDb Top 250 TV", onRemove: () => setFilters({ imdbTopTvOnly: false, page: 1 }) });
  if (filters.sort !== "title")
    chips.push({ key: "sort", label: `Sort: ${sortLabel(filters.sort)}`, onRemove: () => setFilters({ sort: "title", page: 1 }) });
  if (filters.imdbRatingMin > 0)
    chips.push({ key: "imdb", label: `IMDb ${filters.imdbRatingMin}+`, onRemove: () => setFilters({ imdbRatingMin: 0, page: 1 }) });
  if (filters.rtScoreMin > 0)
    chips.push({ key: "rt", label: `RT ${filters.rtScoreMin}%+`, onRemove: () => setFilters({ rtScoreMin: 0, page: 1 }) });
  if (filters.decadeMin !== DECADE_MIN || filters.decadeMax !== DECADE_MAX)
    chips.push({ key: "decade", label: `${filters.decadeMin}–${filters.decadeMax}`, onRemove: () => setFilters({ decadeMin: DECADE_MIN, decadeMax: DECADE_MAX, page: 1 }) });

  return chips;
}

function buildResultContext(filters: FilterState): string {
  const body =
    filters.imdbTopMoviesOnly
      ? "IMDb Top 250 films"
      : filters.imdbTopTvOnly
        ? "IMDb Top 250 TV"
        : filters.awardBody === "goldenglobe"
          ? "Golden Globe"
          : filters.awardBody === "all"
            ? "All award bodies"
            : filters.awardBody;
  const status = filters.winnerOnly ? "winners" : filters.nominatedOnly ? "nominees" : "all results";
  return `${body} / ${status} / ${sortLabel(filters.sort)}`;
}

function sortLabel(sort: FilterState["sort"]): string {
  return SORT_OPTIONS.find((option) => option.value === sort)?.label ?? "Newest";
}

function filtersFromSearchParams(params: URLSearchParams): FilterState {
  const awardBody      = params.get("awardBody");
  const awardYear      = numberParam(params.get("awardYear"));
  const decadeMin      = numberParam(params.get("decadeMin"));
  const decadeMax      = numberParam(params.get("decadeMax"));
  const imdbRatingMin  = numberParam(params.get("imdbRatingMin"));
  const runtimeMax     = numberParam(params.get("runtimeMax"));
  const nominationCount = numberParam(params.get("nominationCount"));
  const rtScoreMin     = numberParam(params.get("rtScoreMin"));
  const page           = numberParam(params.get("page"));
  const sort           = params.get("sort");

  return {
    ...DEFAULT_FILTERS,
    search:           params.get("search")   ?? "",
    person:           params.get("person")   ?? "",
    director:         params.get("director") ?? "",
    femaleDirectorOnly: params.get("femaleDirectorOnly") === "true",
    awardBody:
      awardBody === "oscar" || awardBody === "goldenglobe" || awardBody === "cannes" || awardBody === "all"
        ? awardBody
        : DEFAULT_FILTERS.awardBody,
    winnerOnly:    params.get("winnerOnly")    === "true",
    nominatedOnly: params.get("nominatedOnly") === "true",
    category:      params.get("category")     ?? "",
    awardYear,
    genre:         params.get("genre")        ?? "",
    contentType:   params.get("contentType")  ?? "",
    runtimeMax,
    decadeMin:     decadeMin ?? DEFAULT_FILTERS.decadeMin,
    decadeMax:     decadeMax ?? DEFAULT_FILTERS.decadeMax,
    nominationCount,
    imdbRatingMin: imdbRatingMin ?? DEFAULT_FILTERS.imdbRatingMin,
    imdbRatingMax: numberParam(params.get("imdbRatingMax")),
    rtScoreMin:    rtScoreMin ?? DEFAULT_FILTERS.rtScoreMin,
    certificate:   params.get("certificate") ?? "",
    imdbTopMoviesOnly: params.get("imdbTopMoviesOnly") === "true",
    imdbTopTvOnly:     params.get("imdbTopTvOnly")     === "true",
    tvType:        params.get("tvType") ?? "",
    sort:
      sort === "title" || sort === "rating" || sort === "awards" || sort === "newest"
        ? sort
        : DEFAULT_FILTERS.sort,
    page:          page && page > 0 ? page : DEFAULT_FILTERS.page,
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
