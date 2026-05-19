"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, Globe, Link2, TreePalm, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchPersonSuggestions, filtersToParams, type PersonSuggestion } from "@/lib/api";
import { MOOD_PRESETS, type MoodPreset } from "@/lib/mood-presets";
import { DEFAULT_FILTERS } from "@/hooks/useFilters";
import { cn, nameToSlug } from "@/lib/utils";
import type { FilterState, AwardBody } from "@cineroll/types";

interface FilterBarProps {
  filters: FilterState;
  genres: string[];
  categories: string[];
  awardYears?: number[];
  onFiltersChange: (updates: Partial<FilterState>) => void;
  onClearFilters: () => void;
  className?: string;
}

const DECADE_MIN = 1900;
const DECADE_MAX = 2030;
const DECADE_OPTIONS = Array.from({ length: (DECADE_MAX - DECADE_MIN) / 10 + 1 }, (_, i) => DECADE_MIN + i * 10);

const RUNTIME_BUCKETS: { label: string; runtimeMax: number | null; activeClass: string }[] = [
  {
    label: "Quick Watch",
    runtimeMax: 89,
    activeClass: "border-[#1d4ed8] bg-gradient-to-br from-[#60a5fa] to-[#1d4ed8] text-[#0c1a3e]",
  },
  {
    label: "Standard",
    runtimeMax: 119,
    activeClass: "border-[#64748b] bg-gradient-to-br from-[#e2e8f0] to-[#94a3b8] text-[#0f172a]",
  },
  {
    label: "Long Haul",
    runtimeMax: 149,
    activeClass: "border-[#b45309] bg-gradient-to-br from-[#f59e0b] to-[#b45309] text-[#1c0900]",
  },
  {
    label: "Epic",
    runtimeMax: null,
    activeClass: "border-[#5b21b6] bg-gradient-to-br from-[#a78bfa] to-[#5b21b6] text-[#0d061f]",
  },
];

const AWARD_BODIES: { value: AwardBody; label: string }[] = [
  { value: "all", label: "All" },
  { value: "oscar", label: "Oscar" },
  { value: "goldenglobe", label: "GG" },
  { value: "cannes", label: "Cannes" },
];

export function FilterBar({
  filters,
  genres,
  categories,
  awardYears = [],
  onFiltersChange,
  onClearFilters,
  className,
}: FilterBarProps) {
  const activeChips = getActiveFilterChips(filters, onFiltersChange);
  const recipe = buildRollRecipe(filters);
  const [personSuggestions, setPersonSuggestions] = React.useState<
    PersonSuggestion[]
  >([]);
  const [isPersonSuggestionsOpen, setIsPersonSuggestionsOpen] =
    React.useState(false);
  const [activePreset, setActivePreset] = React.useState<string | null>(null);
  const [isCopied, setIsCopied] = React.useState(false);

  async function handleShareFilters() {
    const params = filtersToParams(filters);
    const url = `${window.location.origin}/browse?${params.toString()}`;
    const captionText = recipe ? `Rolling from: ${recipe}` : "My CineRoll filters";

    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title: "CineRoll — My Roll Recipe", text: captionText, url });
        return;
      } catch { /* user cancelled or API unavailable */ }
    }

    try {
      await navigator.clipboard.writeText(`${captionText}\n${url}`);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 2500);
    } catch { /* ignore */ }
  }

  function applyPreset(preset: MoodPreset) {
    if (activePreset === preset.label) {
      const resetValues: Partial<FilterState> = { page: 1 };
      for (const key of Object.keys(preset.filters) as Array<
        keyof FilterState
      >) {
        Object.assign(resetValues, { [key]: DEFAULT_FILTERS[key] });
      }
      onFiltersChange(resetValues);
      setActivePreset(null);
      return;
    }

    onFiltersChange({ ...preset.filters, page: 1 });
    setActivePreset(preset.label);
  }

  function clearAllFilters() {
    setActivePreset(null);
    onClearFilters();
  }

  React.useEffect(() => {
    const query = filters.person.trim();
    if (query.length < 2) {
      const timer = window.setTimeout(() => {
        setPersonSuggestions([]);
        setIsPersonSuggestionsOpen(false);
      }, 0);
      return () => window.clearTimeout(timer);
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void fetchPersonSuggestions(query).then((suggestions) => {
        if (cancelled) return;
        setPersonSuggestions(suggestions);
        setIsPersonSuggestionsOpen(suggestions.length > 0);
      });
    }, 180);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [filters.person]);

  return (
    <div
      aria-label="Filter films"
      className={cn("flex flex-col gap-3", className)}
    >
      <p className="font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-[0.3em] text-[#686880]">
        Build Your Roll
      </p>

      {/* BODY */}
      <FilterRow label="Body">
        {AWARD_BODIES.map(({ value, label }) => (
          <PillToggle
            key={value}
            active={
              filters.awardBody === value &&
              !filters.imdbTopMoviesOnly &&
              !filters.imdbTopTvOnly
            }
            onClick={() =>
              onFiltersChange({
                awardBody: value,
                imdbTopMoviesOnly: false,
                imdbTopTvOnly: false,
                page: 1,
              })
            }
          >
            <span className="inline-flex items-center gap-1">
              {value === "oscar" && <OscarIcon />}
              {value === "goldenglobe" && <Globe className="h-[14px] w-[14px] shrink-0" aria-hidden />}
              {value === "cannes" && <TreePalm className="h-[14px] w-[14px] shrink-0" aria-hidden />}
              {label}
            </span>
          </PillToggle>
        ))}
        <PillToggle
          active={filters.imdbTopMoviesOnly}
          onClick={() =>
            onFiltersChange({
              imdbTopMoviesOnly: !filters.imdbTopMoviesOnly,
              imdbTopTvOnly: false,
              page: 1,
            })
          }
        >
          IMDb Top 250 Movies
        </PillToggle>
        <PillToggle
          active={filters.imdbTopTvOnly}
          onClick={() =>
            onFiltersChange({
              imdbTopTvOnly: !filters.imdbTopTvOnly,
              imdbTopMoviesOnly: false,
              page: 1,
            })
          }
        >
          IMDb Top 250 Shows
        </PillToggle>
      </FilterRow>

      {/* STATUS */}
      <FilterRow label="Status">
        <PillToggle
          active={!filters.winnerOnly && !filters.nominatedOnly}
          onClick={() =>
            onFiltersChange({
              winnerOnly: false,
              nominatedOnly: false,
              page: 1,
            })
          }
        >
          Any
        </PillToggle>
        <PillToggle
          active={filters.winnerOnly}
          onClick={() =>
            onFiltersChange({ winnerOnly: true, nominatedOnly: false, page: 1 })
          }
        >
          Won
        </PillToggle>
        <PillToggle
          active={filters.nominatedOnly && !filters.winnerOnly}
          onClick={() =>
            onFiltersChange({ winnerOnly: false, nominatedOnly: true, page: 1 })
          }
        >
          Nominated
        </PillToggle>
      </FilterRow>

      {/* Row 1: Person | Genre | Category */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <span className="mb-1 block font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#9090a8]">
            Person
          </span>
          <div className="relative">
            <input
              type="text"
              placeholder="Director, actor…"
              value={filters.person}
              autoComplete="off"
              onChange={(e) =>
                onFiltersChange({ person: e.target.value, page: 1 })
              }
              onFocus={() => {
                if (personSuggestions.length > 0)
                  setIsPersonSuggestionsOpen(true);
              }}
              onBlur={() =>
                window.setTimeout(() => setIsPersonSuggestionsOpen(false), 120)
              }
              className={cn(
                "h-9 w-full rounded-md border border-[#25253a] bg-[#0d0d1a] px-3",
                "font-[family-name:var(--font-geist-mono)] text-[11px] text-[#F5F5F0]",
                "placeholder:text-[#444458] outline-none",
                "focus:border-[#e8453c]/50 focus:ring-1 focus:ring-[#e8453c]/30",
                "transition-colors duration-150",
              )}
            />
            {isPersonSuggestionsOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-md border border-[#2a2a3e] bg-[#0b0b12] shadow-2xl shadow-black/60">
                {personSuggestions.map((suggestion) => (
                  <div key={suggestion.name} className="flex items-center">
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        onFiltersChange({ person: suggestion.name, page: 1 });
                        setIsPersonSuggestionsOpen(false);
                      }}
                      className={cn(
                        "flex min-w-0 flex-1 items-center justify-between gap-3 px-3 py-2 text-left",
                        "transition-colors hover:bg-[#151520] focus-visible:bg-[#151520] focus-visible:outline-none",
                      )}
                    >
                      <span className="truncate text-sm font-medium text-[#F5F5F0]">
                        {suggestion.name}
                      </span>
                      <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#66667a]">
                        {suggestion.roles.slice(0, 2).join(" / ")}
                      </span>
                    </button>
                    <Link
                      href={`/person/${nameToSlug(suggestion.name)}`}
                      onMouseDown={(e) => e.preventDefault()}
                      className="flex h-full shrink-0 items-center px-2.5 text-[#44445a] transition-colors hover:text-[#e8453c]"
                      title={`View ${suggestion.name}'s profile`}
                      tabIndex={-1}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <span className="mb-1 block font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#9090a8]">
            Genre
          </span>
          <Select
            value={filters.genre || "_all"}
            onValueChange={(val) =>
              onFiltersChange({ genre: val === "_all" ? "" : val, page: 1 })
            }
          >
            <SelectTrigger
              className={cn(
                "h-9 border-[#25253a] bg-[#0d0d1a]",
                "font-[family-name:var(--font-geist-mono)] text-[11px] text-[#F5F5F0]",
                "hover:border-[#2a2a3e] focus:ring-[#e8453c] focus:ring-offset-[#09090f]",
              )}
            >
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All</SelectItem>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <span className="mb-1 block font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#9090a8]">
            Category
          </span>
          <Select
            value={filters.category || "_all"}
            onValueChange={(val) =>
              onFiltersChange({ category: val === "_all" ? "" : val, page: 1 })
            }
          >
            <SelectTrigger
              className={cn(
                "h-9 border-[#25253a] bg-[#0d0d1a]",
                "font-[family-name:var(--font-geist-mono)] text-[11px] text-[#F5F5F0]",
                "hover:border-[#2a2a3e] focus:ring-[#e8453c] focus:ring-offset-[#09090f]",
              )}
            >
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: Year | From | To */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <span className="mb-1 block font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#9090a8]">
            Year
          </span>
          <Select
            value={
              filters.awardYear != null ? String(filters.awardYear) : "_any"
            }
            onValueChange={(val) =>
              onFiltersChange({
                awardYear: val === "_any" ? null : Number(val),
                page: 1,
              })
            }
          >
            <SelectTrigger
              className={cn(
                "h-9 border-[#25253a] bg-[#0d0d1a]",
                "font-[family-name:var(--font-geist-mono)] text-[11px] text-[#F5F5F0]",
                "hover:border-[#2a2a3e] focus:ring-[#e8453c] focus:ring-offset-[#09090f]",
              )}
            >
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_any">Any</SelectItem>
              {awardYears.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <span className="mb-1 block font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#9090a8]">
            From
          </span>
          <Select
            value={String(filters.decadeMin)}
            onValueChange={(val) =>
              onFiltersChange({ decadeMin: Number(val), page: 1 })
            }
          >
            <SelectTrigger
              className={cn(
                "h-9 border-[#25253a] bg-[#0d0d1a]",
                "font-[family-name:var(--font-geist-mono)] text-[11px] text-[#F5F5F0]",
                "hover:border-[#2a2a3e] focus:ring-[#e8453c] focus:ring-offset-[#09090f]",
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DECADE_OPTIONS.map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {d === DECADE_MIN ? "Any" : `${d}s`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <span className="mb-1 block font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#9090a8]">
            To
          </span>
          <Select
            value={String(filters.decadeMax)}
            onValueChange={(val) =>
              onFiltersChange({ decadeMax: Number(val), page: 1 })
            }
          >
            <SelectTrigger
              className={cn(
                "h-9 border-[#25253a] bg-[#0d0d1a]",
                "font-[family-name:var(--font-geist-mono)] text-[11px] text-[#F5F5F0]",
                "hover:border-[#2a2a3e] focus:ring-[#e8453c] focus:ring-offset-[#09090f]",
              )}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DECADE_OPTIONS.map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {d === DECADE_MAX ? "Any" : `${d}s`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* IMDb + RT — single row, two columns */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <span className="mb-1 block font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#9090a8]">
            IMDb
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[0, 6, 6.5, 7, 7.5, 8, 8.5, 9].map((rating) => (
              <PillToggle
                key={rating}
                active={filters.imdbRatingMin === rating}
                onClick={() => onFiltersChange({ imdbRatingMin: rating, page: 1 })}
              >
                {rating === 0 ? "Any" : `${rating}+`}
              </PillToggle>
            ))}
          </div>
        </div>
        <div>
          <span className="mb-1 block font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#9090a8]">
            RT
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[0, 50, 60, 70, 80, 90, 95].map((score) => (
              <PillToggle
                key={score}
                active={filters.rtScoreMin === score}
                onClick={() => onFiltersChange({ rtScoreMin: score, page: 1 })}
              >
                {score === 0 ? "Any" : `${score}%+`}
              </PillToggle>
            ))}
          </div>
        </div>
      </div>

      {/* Runtime row */}
      <FilterRow label="Time">
        {RUNTIME_BUCKETS.map(({ label, runtimeMax, activeClass }) => (
          <PillToggle
            key={label}
            active={runtimeMax !== null && filters.runtimeMax === runtimeMax}
            activeClassName={activeClass}
            onClick={() => onFiltersChange({ runtimeMax, page: 1 })}
          >
            {label}
          </PillToggle>
        ))}
      </FilterRow>

      {/* Content type row */}
      <FilterRow label="Type">
        {(
          [
            { value: "", label: "All" },
            { value: "movie", label: "Movie" },
            { value: "short", label: "Short" },
            { value: "animation", label: "Animation" },
            { value: "documentary", label: "Doc" },
            { value: "tv-series", label: "TV Series" },
          ] as { value: string; label: string }[]
        ).map(({ value, label }) => (
          <PillToggle
            key={value}
            active={filters.contentType === value}
            onClick={() => onFiltersChange({ contentType: value, page: 1 })}
          >
            {label}
          </PillToggle>
        ))}
      </FilterRow>

      {/* PRESET tags */}
      <div className="flex flex-wrap gap-2">
        {MOOD_PRESETS.map((preset) => {
          const active = activePreset === preset.label;
          return (
            <button
              key={preset.label}
              type="button"
              aria-pressed={active}
              onClick={() => applyPreset(preset)}
              className={cn(
                "rounded-full border px-3 py-1.5",
                "font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest",
                "transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#e8453c]",
                active
                  ? "border-[#c08818] bg-gradient-to-br from-[#deba4a] to-[#c08818] text-[#1a0d00]"
                  : "border-[#25253a] text-[#9090a8] hover:border-[#e8453c]/40 hover:text-[#F5F5F0]",
              )}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Active filter chips */}
      <AnimatePresence>
        {activeChips.length > 0 && (
          <motion.div
            key="chips-row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-2 -mt-3 mb-2"
          >
            <div className="relative flex flex-1 flex-wrap gap-1.5">
              <AnimatePresence mode="popLayout">
                {activeChips.map((chip) => (
                  <motion.div
                    key={chip.key}
                    layout
                    initial={{ opacity: 0, scale: 0.85, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className={cn(
                      "inline-flex h-6 items-center gap-0 rounded-full",
                      "border border-[#25253a] bg-[#0d0d1a]",
                      "font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-wide text-[#9898b8]",
                    )}
                  >
                    {chip.href && (
                      <Link
                        href={chip.href}
                        className="flex h-full items-center pl-2.5 pr-1 transition-colors hover:text-[#e8453c]"
                        title="View profile"
                      >
                        <ArrowUpRight className="h-3 w-3" aria-hidden />
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={chip.onRemove}
                      className={cn(
                        "flex h-full items-center gap-1 transition-colors hover:text-[#F5F5F0]",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#e8453c] focus-visible:rounded-full",
                        chip.href ? "pr-2.5" : "px-2.5",
                      )}
                      aria-label={`Remove ${chip.label} filter`}
                    >
                      {chip.label}
                      <X className="h-2.5 w-2.5 shrink-0 text-[#9090a8]" aria-hidden />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <button
              type="button"
              onClick={clearAllFilters}
              className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#9090a8] transition-colors hover:text-[#e8453c] focus-visible:outline-none"
            >
              Clear all
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Roll Recipe + share */}
      {recipe && (
        <p className="flex items-center gap-2 font-[family-name:var(--font-geist-mono)] text-[9px] tracking-wide text-[#686880]">
          <span className="min-w-0">
            <span className="text-[#444458]">Rolling from:</span>{" "}{recipe}
          </span>
          <button
            type="button"
            onClick={() => void handleShareFilters()}
            title="Share these filters"
            aria-label="Share these filters"
            className="shrink-0 text-[#444458] transition-colors hover:text-[#e8453c] focus-visible:outline-none focus-visible:text-[#e8453c]"
          >
            {isCopied
              ? <Check className="h-3 w-3" aria-hidden />
              : <Link2 className="h-3 w-3" aria-hidden />}
          </button>
        </p>
      )}
    </div>
  );
}

function buildRollRecipe(filters: FilterState): string {
  const parts: string[] = [];

  if (filters.imdbTopMoviesOnly) {
    parts.push("IMDb Top 250 Movies");
  } else if (filters.imdbTopTvOnly) {
    parts.push("IMDb Top 250 Shows");
  } else {
    const bodyName =
      filters.awardBody === "oscar" ? "Oscar" :
      filters.awardBody === "goldenglobe" ? "Golden Globe" :
      filters.awardBody === "cannes" ? "Cannes" : null;

    if (bodyName !== null) {
      if (filters.winnerOnly) parts.push(`${bodyName} winners`);
      else if (filters.nominatedOnly) parts.push(`${bodyName} nominations`);
      else parts.push(`${bodyName} films`);
    } else {
      if (filters.winnerOnly) parts.push("winners");
      else if (filters.nominatedOnly) parts.push("nominated films");
    }
  }

  const contentLabel =
    filters.contentType === "movie" ? "movies" :
    filters.contentType === "short" ? "short films" :
    filters.contentType === "animation" ? "animations" :
    filters.contentType === "documentary" ? "documentaries" :
    filters.contentType === "tv-series" ? "TV shows" : null;
  if (contentLabel !== null) parts.push(contentLabel);

  if (filters.genre.trim()) parts.push(filters.genre.trim());
  if (filters.category.trim()) parts.push(filters.category.trim());

  const minSet = filters.decadeMin !== DECADE_MIN;
  const maxSet = filters.decadeMax !== DECADE_MAX;
  if (minSet && maxSet) parts.push(`${filters.decadeMin}s–${filters.decadeMax}s`);
  else if (minSet) parts.push(`${filters.decadeMin}s onwards`);
  else if (maxSet) parts.push(`up to ${filters.decadeMax}s`);

  if (filters.awardYear != null) parts.push(`${filters.awardYear} ceremony`);
  if (filters.nominationCount != null) parts.push(`${filters.nominationCount}+ nominations`);
  if (filters.person.trim()) parts.push(filters.person.trim());
  if (filters.femaleDirectorOnly) parts.push("female-directed");
  if (filters.search.trim()) parts.push(`"${filters.search.trim()}"`);
  if (filters.imdbRatingMin > 0) parts.push(`IMDb ${filters.imdbRatingMin}+`);
  if (filters.rtScoreMin > 0) parts.push(`RT ${filters.rtScoreMin}%+`);

  if (filters.runtimeMax != null) {
    const runtimeLabel =
      filters.runtimeMax === 89 ? "Quick Watch" :
      filters.runtimeMax === 119 ? "Standard" :
      filters.runtimeMax === 149 ? "Long Haul" :
      `under ${filters.runtimeMax + 1} min`;
    parts.push(runtimeLabel);
  }

  return parts.join(" · ");
}

function OscarIcon() {
  return (
    <svg
      viewBox="0 0 14 14"
      width="14"
      height="14"
      fill="currentColor"
      aria-hidden
      className="shrink-0"
    >
      <circle cx="7" cy="1.8" r="1.4" />
      <path d="M5.5 3.2 L5 8.5 L9 8.5 L8.5 3.2 Z" />
      <rect x="4" y="8.5" width="6" height="1.5" rx="0.3" />
      <rect x="3" y="10" width="8" height="1.8" rx="0.3" />
      <rect x="2" y="11.8" width="10" height="1.5" rx="0.3" />
    </svg>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-[42px] shrink-0 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#9090a8]">
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function PillToggle({
  active,
  onClick,
  children,
  activeClassName,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  activeClassName?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 transition-colors duration-150",
        "font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-1 focus-visible:ring-offset-[#09090f]",
        active
          ? (activeClassName ?? "border-[#c08818] bg-gradient-to-br from-[#deba4a] to-[#c08818] text-[#1a0d00]")
          : "border-[#25253a] text-[#9898b8] hover:border-[#e8453c]/40 hover:text-[#F5F5F0]",
      )}
    >
      {children}
    </button>
  );
}

type ActiveFilterChip = {
  key: string;
  label: string;
  href?: string;
  onRemove: () => void;
};

function getActiveFilterChips(
  filters: FilterState,
  onFiltersChange: (updates: Partial<FilterState>) => void,
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];

  if (filters.search.trim()) {
    chips.push({
      key: "search",
      label: `Title: ${filters.search.trim()}`,
      onRemove: () => onFiltersChange({ search: "", page: 1 }),
    });
  }

  if (filters.person.trim()) {
    chips.push({
      key: "person",
      label: `Person: ${filters.person.trim()}`,
      href: `/person/${nameToSlug(filters.person.trim())}`,
      onRemove: () => onFiltersChange({ person: "", page: 1 }),
    });
  }

  if (filters.femaleDirectorOnly) {
    chips.push({
      key: "femaleDirectorOnly",
      label: "Female director",
      onRemove: () => onFiltersChange({ femaleDirectorOnly: false, page: 1 }),
    });
  }

  if (filters.awardBody !== "all") {
    const awardBodyLabels: Record<AwardBody, string> = {
      all: "All",
      oscar: "Oscar",
      goldenglobe: "Golden Globe",
      cannes: "Cannes",
    };
    chips.push({
      key: "awardBody",
      label: awardBodyLabels[filters.awardBody],
      onRemove: () => onFiltersChange({ awardBody: "all", page: 1 }),
    });
  }

  if (filters.winnerOnly) {
    chips.push({
      key: "winnerOnly",
      label: "Won",
      onRemove: () =>
        onFiltersChange({ winnerOnly: false, nominatedOnly: false, page: 1 }),
    });
  } else if (filters.nominatedOnly) {
    chips.push({
      key: "nominatedOnly",
      label: "Nominated",
      onRemove: () => onFiltersChange({ nominatedOnly: false, page: 1 }),
    });
  }

  if (filters.category.trim()) {
    chips.push({
      key: "category",
      label: filters.category.trim(),
      onRemove: () => onFiltersChange({ category: "", page: 1 }),
    });
  }

  if (filters.awardYear != null) {
    chips.push({
      key: "awardYear",
      label: `Year: ${filters.awardYear}`,
      onRemove: () => onFiltersChange({ awardYear: null, page: 1 }),
    });
  }

  if (filters.genre.trim()) {
    chips.push({
      key: "genre",
      label: filters.genre.trim(),
      onRemove: () => onFiltersChange({ genre: "", page: 1 }),
    });
  }

  if (filters.runtimeMax != null) {
    chips.push({
      key: "runtimeMax",
      label: `Under ${filters.runtimeMax + 1} min`,
      onRemove: () => onFiltersChange({ runtimeMax: null, page: 1 }),
    });
  }

  if (filters.decadeMin !== DECADE_MIN || filters.decadeMax !== DECADE_MAX) {
    chips.push({
      key: "decade",
      label: `${filters.decadeMin}–${filters.decadeMax}`,
      onRemove: () =>
        onFiltersChange({
          decadeMin: DECADE_MIN,
          decadeMax: DECADE_MAX,
          page: 1,
        }),
    });
  }

  if (filters.nominationCount != null) {
    chips.push({
      key: "nominationCount",
      label: `${filters.nominationCount} nomination${filters.nominationCount === 1 ? "" : "s"}`,
      onRemove: () => onFiltersChange({ nominationCount: null, page: 1 }),
    });
  }

  if (filters.contentType) {
    const contentTypeLabels: Record<string, string> = {
      movie: "Movie",
      short: "Short",
      animation: "Animation",
      documentary: "Documentary",
      "tv-series": "TV Series",
      "tv-mini-series": "TV Mini-Series",
    };
    chips.push({
      key: "contentType",
      label: contentTypeLabels[filters.contentType] ?? filters.contentType,
      onRemove: () => onFiltersChange({ contentType: "", page: 1 }),
    });
  }

  if (filters.imdbTopMoviesOnly) {
    chips.push({
      key: "imdbTopMovies",
      label: "IMDb Top 250 Movies",
      onRemove: () => onFiltersChange({ imdbTopMoviesOnly: false, page: 1 }),
    });
  }

  if (filters.imdbTopTvOnly) {
    chips.push({
      key: "imdbTopTv",
      label: "IMDb Top 250 Shows",
      onRemove: () => onFiltersChange({ imdbTopTvOnly: false, page: 1 }),
    });
  }

  if (filters.imdbRatingMin > 0) {
    chips.push({
      key: "imdb",
      label: `IMDb ${filters.imdbRatingMin}+`,
      onRemove: () => onFiltersChange({ imdbRatingMin: 0, page: 1 }),
    });
  }

  if (filters.rtScoreMin > 0) {
    chips.push({
      key: "rt",
      label: `RT ${filters.rtScoreMin}%+`,
      onRemove: () => onFiltersChange({ rtScoreMin: 0, page: 1 }),
    });
  }

  return chips;
}
