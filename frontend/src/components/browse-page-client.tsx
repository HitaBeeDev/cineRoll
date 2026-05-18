"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Clapperboard,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { AwardBody, FilterState, PaginatedFilms } from "@cineroll/types";
import { FilmCard, FilmCardSkeleton } from "@/components/film-card";
import { AppHeader } from "@/components/app-header";
import { DEFAULT_FILTERS, useFilters } from "@/hooks/useFilters";
import {
  fetchAwardYears,
  fetchCategories,
  fetchFilms,
  fetchGenres,
  fetchPersonSuggestions,
  filtersToParams,
  type PersonSuggestion,
} from "@/lib/api";
import { MOOD_PRESETS } from "@/lib/mood-presets";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 24;
const DECADE_MIN = 1900;
const DECADE_MAX = 2030;
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

const AWARD_BODIES: { value: AwardBody; label: string }[] = [
  { value: "all",         label: "All"    },
  { value: "oscar",       label: "Oscar"  },
  { value: "goldenglobe", label: "GG"     },
  { value: "cannes",      label: "Cannes" },
];

type LoadStatus = "loading" | "success" | "error";

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

  // person autocomplete
  const [personSuggestions,    setPersonSuggestions]    = useState<PersonSuggestion[]>([]);
  const [personDropdownOpen,   setPersonDropdownOpen]   = useState(false);

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

  // person suggestion debounce
  useEffect(() => {
    const query = filters.person.trim();
    if (query.length < 2) {
      const t = window.setTimeout(() => {
        setPersonSuggestions([]);
        setPersonDropdownOpen(false);
      }, 0);
      return () => window.clearTimeout(t);
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void fetchPersonSuggestions(query).then((s) => {
        if (cancelled) return;
        setPersonSuggestions(s);
        setPersonDropdownOpen(s.length > 0);
      });
    }, 180);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [filters.person]);

  const setFilters = useCallback(
    (updates: Partial<FilterState>) => setFilter(updates),
    [setFilter],
  );

  const total       = result?.total    ?? 0;
  const page        = result?.page     ?? filters.page;
  const totalPages  = Math.max(result?.totalPages ?? 1, 1);
  const showingEnd  = result ? Math.min(page * PAGE_SIZE, result.total) : 0;
  const showingStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;

  const activeChips = buildActiveChips(filters, setFilters);

  return (
    <div className="flex min-h-screen flex-col bg-[#09090f] text-[#F5F5F0]">
      <AppHeader />

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-[#141420]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: GRAIN_SVG, backgroundSize: "256px 256px" }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 100% 200% at 50% 150%, #e8453c08, transparent 60%)" }}
        />

        <div className="relative mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex items-center justify-between gap-8 py-8 sm:py-10">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <div className="h-px w-6 bg-[#e8453c]" />
                <span className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.6em] text-[#383850]">
                  The Archive
                </span>
              </div>
              <h1
                className="font-[family-name:var(--font-display)] font-bold leading-none tracking-tight text-[#F0F0F8]"
                style={{ fontSize: "clamp(2.25rem, 5vw, 3.75rem)" }}
              >
                Browse Films
              </h1>
              <p className="mt-3 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.45em] text-[#303048]">
                Oscar · Golden Globe · Cannes · 1929–Today
              </p>
            </div>

          </div>
        </div>

        <div
          className="h-px w-full"
          style={{ background: "linear-gradient(to right, transparent 0%, #e8453c55 35%, #e8453c20 65%, transparent 100%)" }}
        />
      </section>

      {/* ── STICKY FILTER BAR ───────────────────────────────────────────── */}
      <div className="sticky top-0 z-40 border-b border-[#141420] bg-[#09090f]/96 backdrop-blur-xl">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 xl:px-12">

          {/* Primary filter row */}
          <div className="flex flex-wrap items-center gap-2 py-2.5">

            {/* Search */}
            <div className="relative w-[200px] shrink-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-[#2a2a44]" />
              <input
                type="text"
                placeholder="Title, director…"
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value, page: 1 })}
                className="h-8 w-full border border-[#1a1a2c] bg-[#0c0c18] pl-8 pr-3 font-[family-name:var(--font-geist-mono)] text-[10px] text-[#D0D0E8] placeholder:text-[#28283c] outline-none focus:border-[#e8453c]/40 focus:ring-1 focus:ring-[#e8453c]/15 transition-colors"
              />
            </div>

            {/* Divider */}
            <div className="h-5 w-px bg-[#1a1a2c]" />

            {/* Award body */}
            <div className="flex items-center gap-0.5">
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
                      "h-7 px-3 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.25em] transition-all focus-visible:outline-none",
                      active
                        ? "bg-[#e8453c] text-white"
                        : "border border-[#1a1a2c] text-[#505068] hover:border-[#e8453c]/30 hover:text-[#a0a0c0]",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="h-5 w-px bg-[#1a1a2c]" />

            {/* Status */}
            <div className="flex items-center gap-0.5">
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
                    "h-7 px-3 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.25em] transition-all focus-visible:outline-none",
                    active
                      ? "bg-[#D4AF37] text-[#09090f] font-semibold"
                      : "border border-[#1a1a2c] text-[#505068] hover:border-[#D4AF37]/30 hover:text-[#a0a0c0]",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="hidden h-5 w-px bg-[#1a1a2c] sm:block" />

            {/* Genre */}
            <div className="hidden sm:block">
              <Select
                value={filters.genre || "_all"}
                onValueChange={(val) =>
                  setFilters({ genre: val === "_all" ? "" : val, page: 1 })
                }
              >
                <SelectTrigger className="h-7 w-[120px] border-[#1a1a2c] bg-[#0c0c18] font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.2em] text-[#505068] focus:ring-[#e8453c] hover:border-[#e8453c]/30 focus:ring-offset-0 transition-colors">
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent>
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
                "flex h-7 items-center gap-1.5 px-3 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.25em] transition-all border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#e8453c]",
                showMore
                  ? "border-[#e8453c]/50 bg-[#e8453c]/10 text-[#e8453c]"
                  : "border-[#1a1a2c] text-[#505068] hover:border-[#e8453c]/30 hover:text-[#a0a0c0]",
              )}
            >
              <SlidersHorizontal className="h-2.5 w-2.5" aria-hidden />
              Filters
              {hasActiveFilters && (
                <span className="h-1 w-1 rounded-full bg-[#e8453c]" />
              )}
            </button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Count */}
            {status === "success" && total > 0 && (
              <span className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.2em] text-[#303048]">
                <span className="text-[#8080a0]">{total.toLocaleString()}</span> films
                <span className="ml-2 text-[#252538]">· {showingStart}–{showingEnd}</span>
              </span>
            )}
          </div>

          {/* Active chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pb-2">
              {activeChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onRemove}
                  aria-label={`Remove ${chip.label} filter`}
                  className="inline-flex h-5 items-center gap-1 border border-[#1e1e30] bg-[#0d0d1a] px-2 font-[family-name:var(--font-geist-mono)] text-[7px] uppercase tracking-[0.25em] text-[#7070a0] transition-colors hover:border-[#e8453c]/40 hover:text-[#e8453c] focus-visible:outline-none"
                >
                  {chip.label}
                  <X className="h-2 w-2 shrink-0" aria-hidden />
                </button>
              ))}
              <button
                type="button"
                onClick={() => { resetFilters(); setShowMore(false); }}
                className="font-[family-name:var(--font-geist-mono)] text-[7px] uppercase tracking-[0.3em] text-[#303048] transition-colors hover:text-[#e8453c] focus-visible:outline-none ml-0.5"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* ── EXPANDED FILTER PANEL ─────────────────────────── */}
        {showMore && (
          <div className="border-t border-[#141420] bg-[#06060f]/98">
            <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 xl:px-12 py-6">
              <div className="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

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

                {/* Person autocomplete */}
                <PanelSection label="Person (Director / Actor)">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Kubrick, Audrey Hepburn…"
                      value={filters.person}
                      autoComplete="off"
                      onChange={(e) => setFilters({ person: e.target.value, page: 1 })}
                      onFocus={() => { if (personSuggestions.length > 0) setPersonDropdownOpen(true); }}
                      onBlur={() => window.setTimeout(() => setPersonDropdownOpen(false), 120)}
                      className="h-8 w-full border border-[#1a1a2c] bg-[#0c0c18] px-3 font-[family-name:var(--font-geist-mono)] text-[10px] text-[#C8C8E0] placeholder:text-[#252538] outline-none focus:border-[#e8453c]/40 transition-colors"
                    />
                    {personDropdownOpen && (
                      <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 border border-[#1e1e30] bg-[#0a0a16] shadow-2xl shadow-black/70">
                        {personSuggestions.map((s) => (
                          <button
                            key={s.name}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => { setFilters({ person: s.name, page: 1 }); setPersonDropdownOpen(false); }}
                            className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left transition-colors hover:bg-[#121220] focus-visible:outline-none"
                          >
                            <span className="truncate text-sm font-medium text-[#D8D8F0]">{s.name}</span>
                            <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-widest text-[#505068]">
                              {s.roles.slice(0, 2).join(" / ")}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </PanelSection>

                {/* Category */}
                <PanelSection label="Award Category">
                  <Select
                    value={filters.category || "_all"}
                    onValueChange={(val) => setFilters({ category: val === "_all" ? "" : val, page: 1 })}
                  >
                    <SelectTrigger className="h-8 w-full border-[#1a1a2c] bg-[#0c0c18] font-[family-name:var(--font-geist-mono)] text-[9px] text-[#505068] focus:ring-[#e8453c] transition-colors hover:border-[#e8453c]/30 focus:ring-offset-0">
                      <SelectValue placeholder="Any category" />
                    </SelectTrigger>
                    <SelectContent>
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
                    <SelectTrigger className="h-8 w-full border-[#1a1a2c] bg-[#0c0c18] font-[family-name:var(--font-geist-mono)] text-[9px] text-[#505068] focus:ring-[#e8453c] transition-colors hover:border-[#e8453c]/30 focus:ring-offset-0">
                      <SelectValue placeholder="Any year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_any">Any year</SelectItem>
                      {awardYears.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                    </SelectContent>
                  </Select>
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
                    <FilterChip
                      active={filters.femaleDirectorOnly}
                      onClick={() => setFilters({ femaleDirectorOnly: !filters.femaleDirectorOnly, page: 1 })}
                    >
                      Female Director
                    </FilterChip>
                  </div>
                </PanelSection>

                {/* Mood presets */}
                <PanelSection label="Mood Presets">
                  <div className="flex flex-wrap gap-1">
                    {MOOD_PRESETS.map((preset) => (
                      <FilterChip
                        key={preset.label}
                        active={false}
                        onClick={() => { setFilters({ ...preset.filters, page: 1 }); setShowMore(false); }}
                      >
                        {preset.label}
                      </FilterChip>
                    ))}
                  </div>
                </PanelSection>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MAIN GRID ───────────────────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-4 py-8 sm:px-6 lg:px-8 xl:px-12">

        {/* Loading */}
        {status === "loading" && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {Array.from({ length: 18 }).map((_, i) => <FilmCardSkeleton key={i} />)}
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div className="flex min-h-80 flex-col items-center justify-center gap-5 border border-dashed border-[#1e1e30] px-6 py-16 text-center">
            <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.4em] text-[#606078]">
              Something went wrong
            </p>
            <button
              type="button"
              onClick={() => setFilter({ ...filters })}
              className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.35em] text-[#e8453c]/60 transition-colors hover:text-[#e8453c]"
            >
              Try again →
            </button>
          </div>
        )}

        {/* Empty */}
        {status === "success" && result?.films.length === 0 && (
          <div className="flex min-h-80 flex-col items-center justify-center gap-5 border border-dashed border-[#1e1e30] px-6 py-16 text-center">
            <Clapperboard className="h-9 w-9 text-[#1e1e30]" aria-hidden />
            <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.4em] text-[#505068]">
              No films match — try adjusting your filters
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.35em] text-[#e8453c]/60 transition-colors hover:text-[#e8453c]"
            >
              Reset filters →
            </button>
          </div>
        )}

        {/* Grid */}
        {status === "success" && result && result.films.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
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
              className="mt-12 flex items-center justify-between border-t border-[#141420] pt-6"
            >
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setFilters({ page: page - 1 })}
                className="flex items-center gap-2 border border-[#1a1a2c] px-5 py-2.5 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.3em] text-[#606080] transition-colors hover:border-[#e8453c]/30 hover:text-[#c0c0d8] disabled:opacity-20 disabled:cursor-not-allowed focus-visible:outline-none"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                Prev
              </button>

              <p className="font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.3em] text-[#303048]">
                <span className="text-[#8080a0]">{page.toLocaleString()}</span>
                <span className="mx-1.5 text-[#252538]">/</span>
                <span className="text-[#8080a0]">{totalPages.toLocaleString()}</span>
              </p>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setFilters({ page: page + 1 })}
                className="flex items-center gap-2 border border-[#1a1a2c] px-5 py-2.5 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.3em] text-[#606080] transition-colors hover:border-[#e8453c]/30 hover:text-[#c0c0d8] disabled:opacity-20 disabled:cursor-not-allowed focus-visible:outline-none"
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
      <span className="font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.5em] text-[#404058]">
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
        "h-6 px-2.5 font-[family-name:var(--font-geist-mono)] text-[8px] uppercase tracking-[0.2em] transition-all border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#e8453c]",
        active
          ? "border-[#e8453c] bg-[#e8453c] text-white"
          : "border-[#1a1a2c] text-[#505068] hover:border-[#e8453c]/30 hover:text-[#a0a0c0]",
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
  if (filters.imdbRatingMin > 0)
    chips.push({ key: "imdb", label: `IMDb ${filters.imdbRatingMin}+`, onRemove: () => setFilters({ imdbRatingMin: 0, page: 1 }) });
  if (filters.rtScoreMin > 0)
    chips.push({ key: "rt", label: `RT ${filters.rtScoreMin}%+`, onRemove: () => setFilters({ rtScoreMin: 0, page: 1 }) });
  if (filters.decadeMin !== DECADE_MIN || filters.decadeMax !== DECADE_MAX)
    chips.push({ key: "decade", label: `${filters.decadeMin}–${filters.decadeMax}`, onRemove: () => setFilters({ decadeMin: DECADE_MIN, decadeMax: DECADE_MAX, page: 1 }) });

  return chips;
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
