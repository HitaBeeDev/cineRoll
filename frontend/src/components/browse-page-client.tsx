"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownWideNarrow,
  ArrowLeft,
  ArrowRight,
  ArrowUpNarrowWide,
  Clapperboard,
  Search,
  Shuffle,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { AwardBody, FilterState, PaginatedFilms } from "@cineroll/types";
import { FilmCard, FilmCardSkeleton } from "@/components/film-card";
import { AppHeader } from "@/components/app-header";
import { computeHasActiveFilters, DEFAULT_FILTERS } from "@/hooks/useFilters";
import {
  fetchAwardYears,
  fetchAutocomplete,
  fetchCategories,
  fetchCountries,
  fetchFilms,
  fetchGenres,
  fetchRandom,
  filtersToParams,
  type AutocompleteResult,
} from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 25;
// The decade bounds live in DEFAULT_FILTERS (the model); alias them here rather
// than re-typing 1900/2030 across the options list, panel, chips, and count.
const DECADE_MIN = DEFAULT_FILTERS.decadeMin;
const DECADE_MAX = DEFAULT_FILTERS.decadeMax;
const BROWSE_DECADE_OPTIONS = Array.from({ length: (DECADE_MAX - DECADE_MIN) / 10 + 1 }, (_, i) => DECADE_MIN + i * 10);
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

/**
 * An award body and the IMDb curated lists are mutually exclusive: a film is
 * browsed either through an awards corpus or through one of the Top 250 lists,
 * never both. Modeling them as a single "scope" makes that exclusivity visible
 * in one radio group instead of burying it inside click handlers.
 */
type Scope = AwardBody | "imdb-films" | "imdb-tv";

const SCOPE_OPTIONS: { value: Scope; label: string; groupStart?: boolean }[] = [
  { value: "all",         label: "All"                                  },
  { value: "oscar",       label: "Oscar"                                },
  { value: "goldenglobe", label: "Golden Globe"                         },
  { value: "cannes",      label: "Cannes"                               },
  { value: "berlin",      label: "Berlinale"                            },
  { value: "imdb-films",  label: "IMDb Top 250 Films", groupStart: true },
  { value: "imdb-tv",     label: "IMDb Top 250 TV"                      },
];

function scopeFromFilters(f: FilterState): Scope {
  if (f.imdbTopMoviesOnly) return "imdb-films";
  if (f.imdbTopTvOnly)     return "imdb-tv";
  return f.awardBody;
}

function scopeToUpdates(scope: Scope): Partial<FilterState> {
  // Switching onto an IMDb list also clears the win/nom status, which has no
  // meaning for those lists (and the status control is disabled to match).
  if (scope === "imdb-films")
    return { awardBody: "all", imdbTopMoviesOnly: true,  imdbTopTvOnly: false, winnerOnly: false, nominatedOnly: false, page: 1 };
  if (scope === "imdb-tv")
    return { awardBody: "all", imdbTopMoviesOnly: false, imdbTopTvOnly: true,  winnerOnly: false, nominatedOnly: false, page: 1 };
  return { awardBody: scope, imdbTopMoviesOnly: false, imdbTopTvOnly: false, page: 1 };
}

// Constant look shared by every filter dropdown trigger. Deliberately omits the
// utilities that vary per instance (width, text colour, uppercase/tracking) —
// `cn` is a plain join with no tailwind-merge, so those must not be duplicated
// in the base or the override couldn't win.
const SELECT_TRIGGER_BASE =
  "h-10 rounded-md border-white/10 bg-white/[0.045] font-[family-name:var(--font-geist-mono)] text-[11px] transition-colors hover:border-white/20 focus:ring-[#e8453c]/60 focus:ring-offset-0";

type AwardStatus = "any" | "won" | "nom";

const STATUS_OPTIONS: { value: AwardStatus; label: string }[] = [
  { value: "any", label: "Any"  },
  { value: "won", label: "Won"  },
  { value: "nom", label: "Nom." },
];

function statusFromFilters(f: FilterState): AwardStatus {
  if (f.winnerOnly)    return "won";
  if (f.nominatedOnly) return "nom";
  return "any";
}

function statusToUpdates(status: AwardStatus): Partial<FilterState> {
  return { winnerOnly: status === "won", nominatedOnly: status === "nom", page: 1 };
}

/**
 * Display-only overrides for verbose/awkward country names. The stored value
 * (the TMDB form used for filtering) is unchanged — only the label differs.
 */
const COUNTRY_DISPLAY_NAMES: Record<string, string> = {
  "United States of America": "United States",
  "United Kingdom of Great Britain and Northern Ireland": "United Kingdom",
  "Syrian Arab Republic": "Syria",
  "Kyrgyz Republic": "Kyrgyzstan",
  "Cote D'Ivoire": "Côte d'Ivoire",
  "Palestinian Territory": "Palestine",
  "Russian Federation": "Russia",
};

function countryLabel(value: string): string {
  return COUNTRY_DISPLAY_NAMES[value] ?? value;
}

type LoadStatus = "loading" | "success" | "error";

const SORT_OPTIONS: { value: FilterState["sort"]; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "rating", label: "IMDb" },
  { value: "rt",     label: "RT" },
  { value: "awards", label: "Awards" },
  { value: "title",  label: "A-Z" },
];

export function BrowsePageClient() {
  const shouldReduceMotion = useReducedMotion();
  const router    = useRouter();
  const pathname  = usePathname();
  const searchParams = useSearchParams();

  // ── URL is the single source of truth ──────────────────────────────────
  // `filters` is derived from the query string; nothing mirrors it back into
  // component state. Edits write to the URL and flow back in through
  // `searchParams`, so back/forward navigation just works and there is no
  // bidirectional sync (and no setTimeout/guard-ref dance) to keep honest.
  const filters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams]);
  const hasActiveFilters = useMemo(() => computeHasActiveFilters(filters), [filters]);

  const [genres,     setGenres]     = useState<string[]>([]);
  const [countries,  setCountries]  = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [awardYears, setAwardYears] = useState<number[]>([]);
  const [result,     setResult]     = useState<PaginatedFilms | null>(null);
  const [status,     setStatus]     = useState<LoadStatus>("loading");
  const [reloadNonce, setReloadNonce] = useState(0);
  const [showMore, setShowMore] = useState(false);

  // Local buffer so the search box echoes keystrokes instantly while the URL
  // (the real source of truth) is updated underneath it. When the URL's search
  // changes from outside the input (back/forward, chip removal, reset) we adjust
  // the draft during render — the documented pattern, no mirroring effect.
  const [searchDraft, setSearchDraft] = useState(filters.search);
  const [lastUrlSearch, setLastUrlSearch] = useState(filters.search);
  if (filters.search !== lastUrlSearch) {
    setLastUrlSearch(filters.search);
    setSearchDraft(filters.search);
  }

  // First grid paint gets the staggered entrance; every later result set uses a
  // quick uniform fade. Flipped once, during render, the first time a non-empty
  // grid is shown — so browsing doesn't pay a ~0.4s cascade on every tap.
  const showGrid = status === "success" && !!result && result.films.length > 0;
  const [hasAnimatedGrid, setHasAnimatedGrid] = useState(false);
  if (showGrid && !hasAnimatedGrid) setHasAnimatedGrid(true);
  const firstGridPaint = showGrid && !hasAnimatedGrid;

  const [rolling, setRolling] = useState(false);

  const [acResults, setAcResults] = useState<AutocompleteResult | null>(null);
  const [acOpen, setAcOpen] = useState(false);
  const [acIdx, setAcIdx] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const commitFilters = useCallback(
    (updates: Partial<FilterState>) => {
      const next = { ...filters, ...updates };
      const query = serializeFilters(next);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [filters, pathname, router],
  );

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  useEffect(() => {
    void fetchGenres().then(setGenres);
    void fetchCountries().then(setCountries);
    void fetchCategories().then(setCategories);
    void fetchAwardYears().then(setAwardYears);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setStatus("loading");
      void fetchFilms(filters, PAGE_SIZE)
        .then((data) => { if (!cancelled) { setResult(data); setStatus("success"); } })
        .catch(()    => { if (!cancelled) { setResult(null); setStatus("error");   } });
    }, 300);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [filters, reloadNonce]);

  useEffect(() => {
    const q = filters.search.trim();
    if (q.length < 2) {
      const timer = window.setTimeout(() => {
        setAcResults(null);
        setAcOpen(false);
      }, 0);
      return () => window.clearTimeout(timer);
    }
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
    (updates: Partial<FilterState>) => {
      commitFilters(updates);

      const changedKeys = Object.keys(updates).filter(key => key !== "page");
      if (changedKeys.length === 0) return;

      if (Object.prototype.hasOwnProperty.call(updates, "search")) {
        trackEvent({
          type: "search",
          context: {
            source: "browse",
            query: updates.search ?? "",
          },
        });
        return;
      }

      trackEvent({
        type: "filter_apply",
        context: {
          source: "browse",
          updates,
        },
      });
    },
    [commitFilters],
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
      trackEvent({
        type: "roll",
        filmId: film.id,
        context: {
          source: "browse_results",
          filters,
        },
      });
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
  const hasResult = result != null;
  // Keep the last count on screen while a new query is in flight so the most
  // reassuring number on the page refreshes in place instead of flickering away.
  const isStaleCount = status === "loading" && hasResult;

  const scope       = scopeFromFilters(filters);
  const awardStatus = statusFromFilters(filters);
  const scopeIsImdb = scope === "imdb-films" || scope === "imdb-tv";

  const activeChips = buildActiveChips(filters, setFilters);
  const advancedCount = countAdvancedFilters(filters);
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
          <div className="flex flex-col gap-3 py-4 sm:py-5">
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
            <div ref={searchContainerRef} className="relative w-full min-w-0 sm:grow sm:basis-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6f6b80]" />
              <input
                type="text"
                placeholder="Search films or people…"
                value={searchDraft}
                onChange={(e) => { setSearchDraft(e.target.value); setFilters({ search: e.target.value, page: 1 }); }}
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
                      <div className="px-3 pt-2.5 pb-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.28em] text-[#555064]">
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
                          <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] text-[#555064]">
                            {film.year}
                          </span>
                        </button>
                      ))}
                    </>
                  )}
                  {acResults.people.length > 0 && (
                    <>
                      <div className={cn(
                        "px-3 pb-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.28em] text-[#555064]",
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
                            <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] capitalize text-[#555064]">
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

            {/* Scope — an award body or an IMDb list; the two are exclusive */}
            <SegmentedControl
              ariaLabel="Browse scope"
              options={SCOPE_OPTIONS}
              value={scope}
              onChange={(value) => setFilters(scopeToUpdates(value))}
            />

            {/* Divider */}
            <div className="hidden h-6 w-px bg-white/10 xl:block" />

            {/* Award status — disabled while an IMDb list is the active scope */}
            <SegmentedControl
              ariaLabel="Award status"
              options={STATUS_OPTIONS}
              value={awardStatus}
              onChange={(value) => setFilters(statusToUpdates(value))}
              disabled={scopeIsImdb}
              disabledHint="Win / nomination filters don't apply to IMDb lists"
            />

            {/* Divider */}
            <div className="hidden h-6 w-px bg-white/10 sm:block" />

            {/* Genre */}
            <div className="hidden sm:block">
              <FilterSelect
                value={filters.genre || "_all"}
                onValueChange={(val) => setFilters({ genre: val === "_all" ? "" : val, page: 1 })}
                placeholder="Genre"
                className="w-[158px] uppercase tracking-[0.14em] text-[#b8b5c8]"
                options={[{ value: "_all", label: "All genres" }, ...genres.map((g) => ({ value: g, label: g }))]}
              />
            </div>

            {/* Advanced filters disclosure */}
            <button
              type="button"
              onClick={() => setShowMore((v) => !v)}
              aria-expanded={showMore}
              className={cn(
                "flex h-10 items-center gap-2 rounded-md border px-3.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/40",
                showMore || advancedCount > 0
                  ? "border-[#e8453c]/55 bg-[#e8453c]/12 text-[#ff766d]"
                  : "border-white/10 bg-white/[0.045] text-[#b8b5c8] hover:border-white/20 hover:text-[#f1eff8]",
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
              Advanced
              {advancedCount > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e8453c] px-1 text-[10px] font-semibold leading-none text-white">
                  {advancedCount}
                </span>
              )}
            </button>
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
                  className="inline-flex h-7 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.045] px-2.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#a9a5bc] transition-colors hover:border-[#e8453c]/45 hover:text-[#ff766d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/30"
                >
                  {chip.label}
                  <X className="h-2.5 w-2.5 shrink-0" aria-hidden />
                </button>
              ))}
              <button
                type="button"
                onClick={() => { resetFilters(); setShowMore(false); }}
                className="ml-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.24em] text-[#706b82] transition-colors hover:text-[#ff766d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/30"
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
                  <ChipGroup label="Minimum IMDb rating">
                    {[0, 6, 6.5, 7, 7.5, 8, 8.5, 9].map((r) => (
                      <FilterChip
                        key={r}
                        active={filters.imdbRatingMin === r}
                        onClick={() => setFilters({ imdbRatingMin: r, page: 1 })}
                      >
                        {r === 0 ? "Any" : `${r}+`}
                      </FilterChip>
                    ))}
                  </ChipGroup>
                </PanelSection>

                {/* RT */}
                <PanelSection label="Rotten Tomatoes">
                  <ChipGroup label="Minimum Rotten Tomatoes score">
                    {[0, 50, 60, 70, 80, 90, 95].map((s) => (
                      <FilterChip
                        key={s}
                        active={filters.rtScoreMin === s}
                        onClick={() => setFilters({ rtScoreMin: s, page: 1 })}
                      >
                        {s === 0 ? "Any" : `${s}%+`}
                      </FilterChip>
                    ))}
                  </ChipGroup>
                </PanelSection>

                {/* Type */}
                <PanelSection label="Content Type">
                  <ChipGroup label="Content type">
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
                  </ChipGroup>
                </PanelSection>

                {/* Category */}
                <PanelSection label="Award Category">
                  <FilterSelect
                    value={filters.category || "_all"}
                    onValueChange={(val) => setFilters({ category: val === "_all" ? "" : val, page: 1 })}
                    placeholder="Any category"
                    className="w-full text-[#b8b5c8]"
                    options={[{ value: "_all", label: "Any category" }, ...categories.map((c) => ({ value: c, label: c }))]}
                  />
                </PanelSection>

                {/* Geo + time — kept on one row across breakpoints */}
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:col-span-2 sm:grid-cols-2 lg:col-span-3 lg:grid-cols-4 xl:col-span-4">
                {/* Country */}
                <PanelSection label="Country">
                  <FilterSelect
                    value={filters.country || "_all"}
                    onValueChange={(val) => setFilters({ country: val === "_all" ? "" : val, page: 1 })}
                    placeholder="Any country"
                    className="w-full text-[#b8b5c8]"
                    options={[{ value: "_all", label: "Any country" }, ...countries.map((c) => ({ value: c, label: countryLabel(c) }))]}
                  />
                </PanelSection>

                {/* Ceremony year */}
                <PanelSection label="Ceremony Year">
                  <FilterSelect
                    value={filters.awardYear != null ? String(filters.awardYear) : "_any"}
                    onValueChange={(val) => setFilters({ awardYear: val === "_any" ? null : Number(val), page: 1 })}
                    placeholder="Any year"
                    className="w-full text-[#b8b5c8]"
                    options={[{ value: "_any", label: "Any year" }, ...awardYears.map((y) => ({ value: String(y), label: String(y) }))]}
                  />
                </PanelSection>

                {/* Decade — the heading and the dash convey the range, so the two
                    selects need no From/To captions (kept as aria-labels), which
                    also lets all three controls in this row share one baseline. */}
                <PanelSection label="Decade range" className="lg:col-span-2">
                  <div className="flex items-center gap-2">
                    <FilterSelect
                      value={String(filters.decadeMin)}
                      onValueChange={(val) => setFilters({ decadeMin: Number(val), page: 1 })}
                      ariaLabel="Decade from"
                      className="w-full flex-1 text-[#b8b5c8]"
                      options={BROWSE_DECADE_OPTIONS.map((d) => ({ value: String(d), label: d === DECADE_MIN ? "Earliest" : `${d}s` }))}
                    />
                    <span className="font-[family-name:var(--font-geist-mono)] text-[12px] text-[#56515f]" aria-hidden>–</span>
                    <FilterSelect
                      value={String(filters.decadeMax)}
                      onValueChange={(val) => setFilters({ decadeMax: Number(val), page: 1 })}
                      ariaLabel="Decade to"
                      className="w-full flex-1 text-[#b8b5c8]"
                      options={BROWSE_DECADE_OPTIONS.map((d) => ({ value: String(d), label: d === DECADE_MAX ? "Latest" : `${d}s` }))}
                    />
                  </div>
                </PanelSection>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── MAIN GRID ───────────────────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-[100vw] flex-1 px-4 py-6 sm:max-w-screen-2xl sm:px-6 sm:py-8 lg:px-8 xl:px-12">
        <div className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2
              aria-live="polite"
              className={cn(
                "text-xl font-semibold tracking-normal text-[#f2eff8] transition-opacity duration-200 sm:text-2xl",
                isStaleCount && "opacity-40",
              )}
            >
              {hasResult
                ? `${total.toLocaleString()} ${total === 1 ? "film" : "films"}`
                : status === "loading"
                  ? "Loading films"
                  : "Browse results"}
            </h2>
            {hasResult && total > 0 && (
              <p
                className={cn(
                  "mt-1 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-[#817c91] transition-opacity duration-200",
                  isStaleCount && "opacity-40",
                )}
              >
                Showing {showingStart.toLocaleString()}-{showingEnd.toLocaleString()} of {total.toLocaleString()}
              </p>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              disabled={rolling || status === "loading" || total === 0}
              onClick={() => { void handleRollFromResults(); }}
              className="flex shrink-0 items-center gap-2 rounded-lg border border-[#e8453c]/40 bg-[#e8453c]/10 px-4 py-2.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-[#ff766d] transition-all hover:border-[#e8453c]/70 hover:bg-[#e8453c]/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/40 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Shuffle className={cn("h-3.5 w-3.5", rolling && "animate-spin")} aria-hidden />
              {rolling ? "Rolling…" : total === 0 && status === "success" ? "No matches" : status === "success" ? `Roll from ${total.toLocaleString()} films` : "Roll from these results"}
            </button>
          )}

          <div className="flex w-full items-center gap-2 lg:w-auto">
            <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#7d788e]">
              Sort by
            </span>
            <FilterSelect
              value={filters.sort}
              onValueChange={(val) => setFilters({ sort: val as FilterState["sort"], page: 1 })}
              className="w-full min-w-[150px] uppercase tracking-[0.14em] text-[#e8e5f4] lg:w-[150px]"
              options={SORT_OPTIONS}
            />
            <button
              type="button"
              aria-label={filters.sortOrder === "asc" ? "Switch to descending" : "Switch to ascending"}
              title={filters.sortOrder === "asc" ? "Ascending" : "Descending"}
              onClick={() => setFilters({ sortOrder: filters.sortOrder === "asc" ? "desc" : "asc", page: 1 })}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.045] text-[#b8b5c8] transition-colors hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/35"
            >
              {filters.sortOrder === "asc"
                ? <ArrowUpNarrowWide className="h-4 w-4" aria-hidden />
                : <ArrowDownWideNarrow className="h-4 w-4" aria-hidden />}
            </button>
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
            <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.32em] text-[#8e899e]">
              Something went wrong
            </p>
            <button
              type="button"
              onClick={() => setReloadNonce((n) => n + 1)}
              className="rounded-full border border-[#e8453c]/35 px-4 py-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.24em] text-[#ff766d] transition-colors hover:border-[#e8453c]/70 hover:text-white"
            >
              Try again →
            </button>
          </div>
        )}

        {/* Empty */}
        {status === "success" && result?.films.length === 0 && (
          <div className="flex min-h-80 flex-col items-center justify-center gap-5 rounded-lg border border-dashed border-white/12 bg-white/[0.025] px-6 py-16 text-center">
            <Clapperboard className="h-10 w-10 text-[#555064]" aria-hidden />
            <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.28em] text-[#8e899e]">
              No films match — try adjusting your filters
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-full border border-[#e8453c]/35 px-4 py-2 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.24em] text-[#ff766d] transition-colors hover:border-[#e8453c]/70 hover:text-white"
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
                  initial={{ opacity: 0, y: shouldReduceMotion || !firstGridPaint ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: shouldReduceMotion || !firstGridPaint ? 0 : Math.min(index * 0.025, 0.4),
                    duration: shouldReduceMotion ? 0 : firstGridPaint ? 0.22 : 0.16,
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
                className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.035] px-5 py-2.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.22em] text-[#a9a5bc] transition-colors hover:border-[#e8453c]/35 hover:text-white disabled:cursor-not-allowed disabled:opacity-25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/30"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                Prev
              </button>

              <p className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.22em] text-[#686378]">
                <span className="text-[#dedbea]">{page.toLocaleString()}</span>
                <span className="mx-1.5 text-[#575266]">/</span>
                <span className="text-[#dedbea]">{totalPages.toLocaleString()}</span>
              </p>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setFilters({ page: page + 1 })}
                className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.035] px-5 py-2.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.22em] text-[#a9a5bc] transition-colors hover:border-[#e8453c]/35 hover:text-white disabled:cursor-not-allowed disabled:opacity-25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/30"
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

function PanelSection({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2${className ? ` ${className}` : ""}`}>
      <span className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.3em] text-[#8e899e]">
        {label}
      </span>
      {children}
    </div>
  );
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  disabled = false,
  disabledHint,
}: {
  options: { value: T; label: string; groupStart?: boolean }[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  disabled?: boolean;
  disabledHint?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      title={disabled ? disabledHint : undefined}
      className={cn(
        "flex w-full max-w-full items-center gap-1 overflow-x-auto rounded-md border border-white/10 bg-white/[0.025] p-1 transition-opacity sm:w-auto sm:overflow-visible",
        disabled && "pointer-events-none opacity-40",
      )}
    >
      {options.map((opt, i) => {
        const active = opt.value === value;
        return (
          <Fragment key={opt.value}>
            {/* A heavier divider marks a group break (e.g. award bodies → IMDb lists) */}
            {i > 0 && (
              <span
                aria-hidden
                className={cn("w-px shrink-0", opt.groupStart ? "mx-1 h-5 bg-white/20" : "h-4 bg-white/10")}
              />
            )}
            <button
              type="button"
              role="radio"
              aria-checked={active}
              tabIndex={disabled ? -1 : 0}
              onClick={() => onChange(opt.value)}
              className={cn(
                "h-8 shrink-0 rounded px-3.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.14em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/40",
                active
                  ? "bg-[#e8453c] text-white shadow-[0_0_24px_rgba(232,69,60,0.24)]"
                  : "text-[#7f7a91] hover:bg-white/[0.055] hover:text-[#f1eff8]",
              )}
            >
              {opt.label}
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}

/** A filter dropdown with the shared trigger styling, content panel, and option mapping baked in. */
function FilterSelect({
  value,
  onValueChange,
  options,
  placeholder,
  ariaLabel,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger aria-label={ariaLabel} className={cn(SELECT_TRIGGER_BASE, className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="border-white/10 bg-[#101019]">
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
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
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        "h-8 rounded-md border px-3 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/35",
        active
          ? "border-[#e8453c] bg-[#e8453c] text-white"
          : "border-white/10 bg-white/[0.035] text-[#a9a5bc] hover:border-white/20 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

/** Wraps a set of single-select FilterChips so assistive tech reads them as one radio group. */
function ChipGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1">
      {children}
    </div>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────────── */

type ActiveChip = { key: string; label: string; onRemove: () => void };

type SetFilters = (u: Partial<FilterState>) => void;

/**
 * Single source of truth for "what does a non-default filter look like." Each
 * descriptor knows whether the filter is active (vs. its default in
 * DEFAULT_FILTERS), whether it lives behind the Advanced disclosure, and how to
 * render/clear its removable chip. The active-chip list and the advanced badge
 * count are both derived from this one ordered table — change a filter here and
 * both stay in agreement. (The defaults themselves stay in DEFAULT_FILTERS; this
 * table only references them.)
 */
type FilterDescriptor = {
  advanced: boolean;
  isActive: (f: FilterState) => boolean;
  toChip: (f: FilterState, set: SetFilters) => ActiveChip;
};

const FILTER_DESCRIPTORS: FilterDescriptor[] = [
  { advanced: false, isActive: (f) => !!f.search.trim(),
    toChip: (f, set) => ({ key: "search", label: `"${f.search.trim()}"`, onRemove: () => set({ search: "", page: 1 }) }) },
  { advanced: false, isActive: (f) => !!f.person.trim(),
    toChip: (f, set) => ({ key: "person", label: f.person.trim(), onRemove: () => set({ person: "", page: 1 }) }) },
  { advanced: false, isActive: (f) => f.femaleDirectorOnly,
    toChip: (_f, set) => ({ key: "femaleDir", label: "Female director", onRemove: () => set({ femaleDirectorOnly: false, page: 1 }) }) },
  { advanced: false, isActive: (f) => f.awardBody !== "all",
    toChip: (f, set) => ({ key: "body", label: awardBodyLabel(f.awardBody), onRemove: () => set({ awardBody: "all", page: 1 }) }) },
  { advanced: false, isActive: (f) => f.winnerOnly || f.nominatedOnly,
    toChip: (f, set) => f.winnerOnly
      ? { key: "won", label: "Won", onRemove: () => set({ winnerOnly: false, page: 1 }) }
      : { key: "nom", label: "Nominated", onRemove: () => set({ nominatedOnly: false, page: 1 }) } },
  { advanced: false, isActive: (f) => !!f.genre.trim(),
    toChip: (f, set) => ({ key: "genre", label: f.genre, onRemove: () => set({ genre: "", page: 1 }) }) },
  { advanced: true, isActive: (f) => !!f.country.trim(),
    toChip: (f, set) => ({ key: "country", label: countryLabel(f.country), onRemove: () => set({ country: "", page: 1 }) }) },
  { advanced: true, isActive: (f) => !!f.category.trim(),
    toChip: (f, set) => ({ key: "cat", label: f.category, onRemove: () => set({ category: "", page: 1 }) }) },
  { advanced: true, isActive: (f) => f.awardYear != null,
    toChip: (f, set) => ({ key: "year", label: String(f.awardYear), onRemove: () => set({ awardYear: null, page: 1 }) }) },
  { advanced: true, isActive: (f) => !!f.contentType,
    toChip: (f, set) => ({ key: "type", label: f.contentType, onRemove: () => set({ contentType: "", page: 1 }) }) },
  { advanced: false, isActive: (f) => f.imdbTopMoviesOnly,
    toChip: (_f, set) => ({ key: "imdbMovies", label: "IMDb Top 250 Films", onRemove: () => set({ imdbTopMoviesOnly: false, page: 1 }) }) },
  { advanced: false, isActive: (f) => f.imdbTopTvOnly,
    toChip: (_f, set) => ({ key: "imdbTv", label: "IMDb Top 250 TV", onRemove: () => set({ imdbTopTvOnly: false, page: 1 }) }) },
  { advanced: false, isActive: (f) => f.sort !== "awards",
    toChip: (f, set) => ({ key: "sort", label: `Sort: ${sortLabel(f.sort)}`, onRemove: () => set({ sort: "awards", page: 1 }) }) },
  { advanced: true, isActive: (f) => f.imdbRatingMin > 0,
    toChip: (f, set) => ({ key: "imdb", label: `IMDb ${f.imdbRatingMin}+`, onRemove: () => set({ imdbRatingMin: 0, page: 1 }) }) },
  { advanced: true, isActive: (f) => f.rtScoreMin > 0,
    toChip: (f, set) => ({ key: "rt", label: `RT ${f.rtScoreMin}%+`, onRemove: () => set({ rtScoreMin: 0, page: 1 }) }) },
  { advanced: true, isActive: (f) => f.decadeMin !== DECADE_MIN || f.decadeMax !== DECADE_MAX,
    toChip: (f, set) => ({ key: "decade", label: `${f.decadeMin}–${f.decadeMax}`, onRemove: () => set({ decadeMin: DECADE_MIN, decadeMax: DECADE_MAX, page: 1 }) }) },
];

function buildActiveChips(filters: FilterState, setFilters: SetFilters): ActiveChip[] {
  return FILTER_DESCRIPTORS.filter((d) => d.isActive(filters)).map((d) => d.toChip(filters, setFilters));
}

/** Count of active filters that live behind the Advanced disclosure (not the always-visible primary bar). */
function countAdvancedFilters(filters: FilterState): number {
  return FILTER_DESCRIPTORS.filter((d) => d.advanced && d.isActive(filters)).length;
}

function awardBodyLabel(awardBody: AwardBody): string {
  const labels: Record<AwardBody, string> = {
    all: "All",
    oscar: "Oscar",
    goldenglobe: "Golden Globe",
    cannes: "Cannes",
    berlin: "Berlinale",
  };
  return labels[awardBody];
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
  const sortOrder      = params.get("sortOrder");

  return {
    ...DEFAULT_FILTERS,
    search:           params.get("search")   ?? "",
    person:           params.get("person")   ?? "",
    director:         params.get("director") ?? "",
    femaleDirectorOnly: params.get("femaleDirectorOnly") === "true",
    awardBody:
      awardBody === "oscar" || awardBody === "goldenglobe" || awardBody === "cannes" || awardBody === "berlin" || awardBody === "all"
        ? awardBody
        : DEFAULT_FILTERS.awardBody,
    winnerOnly:    params.get("winnerOnly")    === "true",
    nominatedOnly: params.get("nominatedOnly") === "true",
    category:      params.get("category")     ?? "",
    awardYear,
    genre:         params.get("genre")        ?? "",
    country:       params.get("country")       ?? "",
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
      sort === "title" || sort === "rating" || sort === "rt" || sort === "awards" || sort === "newest"
        ? sort
        : DEFAULT_FILTERS.sort,
    sortOrder: sortOrder === "asc" || sortOrder === "desc" ? sortOrder : DEFAULT_FILTERS.sortOrder,
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
