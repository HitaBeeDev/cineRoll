"use client";

import * as React from "react";
import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchPersonSuggestions, type PersonSuggestion } from "@/lib/api";
import { MOOD_PRESETS, type MoodPreset } from "@/lib/mood-presets";
import { DEFAULT_FILTERS } from "@/hooks/useFilters";
import { cn } from "@/lib/utils";
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
  const [personSuggestions, setPersonSuggestions] = React.useState<PersonSuggestion[]>([]);
  const [isPersonSuggestionsOpen, setIsPersonSuggestionsOpen] = React.useState(false);
  const [activePreset, setActivePreset] = React.useState<string | null>(null);

  function applyPreset(preset: MoodPreset) {
    if (activePreset === preset.label) {
      const resetValues: Partial<FilterState> = { page: 1 };
      for (const key of Object.keys(preset.filters) as Array<keyof FilterState>) {
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
    <div aria-label="Filter films" className={cn("flex flex-col gap-3", className)}>

      {/* BODY + STATUS in one row */}
      <div className="flex gap-3">
        <div className="flex-1">
          <FilterRow label="Body">
            {AWARD_BODIES.map(({ value, label }) => (
              <PillToggle
                key={value}
                active={filters.awardBody === value}
                onClick={() => onFiltersChange({ awardBody: value, page: 1 })}
              >
                {label}
              </PillToggle>
            ))}
          </FilterRow>
        </div>

        <div className="flex-1">
          <FilterRow label="Status">
            <PillToggle
              active={!filters.winnerOnly && !filters.nominatedOnly}
              onClick={() =>
                onFiltersChange({ winnerOnly: false, nominatedOnly: false, page: 1 })
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
        </div>
      </div>

      {/* PERSON + GENRE selects */}
      <div className="flex gap-3">
        <div className="flex-1">
          <span className="mb-1 block font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#555568]">
            Person
          </span>
          <div className="relative">
            <input
              type="text"
              placeholder="Director, actor…"
              value={filters.person}
              autoComplete="off"
              onChange={(e) => onFiltersChange({ person: e.target.value, page: 1 })}
              onFocus={() => {
                if (personSuggestions.length > 0) setIsPersonSuggestionsOpen(true);
              }}
              onBlur={() => window.setTimeout(() => setIsPersonSuggestionsOpen(false), 120)}
              className={cn(
                "h-9 w-full rounded-md border border-[#1e1e2a] bg-[#0d0d1a] px-3",
                "font-[family-name:var(--font-geist-mono)] text-[11px] text-[#F5F5F0]",
                "placeholder:text-[#444458] outline-none",
                "focus:border-[#e8453c]/50 focus:ring-1 focus:ring-[#e8453c]/30",
                "transition-colors duration-150",
              )}
            />
            {isPersonSuggestionsOpen && (
              <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-md border border-[#2a2a3e] bg-[#0b0b12] shadow-2xl shadow-black/60">
                {personSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.name}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onFiltersChange({ person: suggestion.name, page: 1 });
                      setIsPersonSuggestionsOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 px-3 py-2 text-left",
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
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <span className="mb-1 block font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#555568]">
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
                "h-9 border-[#1e1e2a] bg-[#0d0d1a]",
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
      </div>

      {/* CATEGORY + YEAR selects */}
      <div className="flex gap-3">
        <div className="flex-1">
          <span className="mb-1 block font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#555568]">
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
                "h-9 border-[#1e1e2a] bg-[#0d0d1a]",
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

        <div className="flex-1">
          <span className="mb-1 block font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#555568]">
            Year
          </span>
          <Select
            value={filters.awardYear != null ? String(filters.awardYear) : "_any"}
            onValueChange={(val) =>
              onFiltersChange({ awardYear: val === "_any" ? null : Number(val), page: 1 })
            }
          >
            <SelectTrigger
              className={cn(
                "h-9 border-[#1e1e2a] bg-[#0d0d1a]",
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
      </div>

      {/* IMDB rating row */}
      <FilterRow label="IMDb">
        {[0, 6, 6.5, 7, 7.5, 8, 8.5, 9].map((rating) => (
          <PillToggle
            key={rating}
            active={filters.imdbRatingMin === rating}
            onClick={() => onFiltersChange({ imdbRatingMin: rating, page: 1 })}
          >
            {rating === 0 ? "Any" : `${rating}+`}
          </PillToggle>
        ))}
      </FilterRow>

      {/* RT score row */}
      <FilterRow label="RT">
        {[0, 50, 60, 70, 80, 90, 95].map((score) => (
          <PillToggle
            key={score}
            active={filters.rtScoreMin === score}
            onClick={() => onFiltersChange({ rtScoreMin: score, page: 1 })}
          >
            {score === 0 ? "Any" : `${score}%+`}
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
                  ? "border-[#e8453c] bg-[#e8453c] text-[#F5F5F0]"
                  : "border-[#1e1e2a] text-[#555568] hover:border-[#e8453c]/40 hover:text-[#F5F5F0]",
              )}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex items-start gap-2 pt-1">
          <div className="flex flex-1 flex-wrap gap-1.5">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onRemove}
                className={cn(
                  "inline-flex h-6 items-center gap-1 rounded-full",
                  "border border-[#1e1e2a] bg-[#0d0d1a] px-2.5",
                  "font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-wide text-[#888899]",
                  "transition-colors hover:border-[#e8453c]/40 hover:text-[#F5F5F0]",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#e8453c]",
                )}
                aria-label={`Remove ${chip.label} filter`}
              >
                {chip.label}
                <X className="h-2.5 w-2.5 shrink-0 text-[#555568]" aria-hidden />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={clearAllFilters}
            className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#555568] transition-colors hover:text-[#e8453c] focus-visible:outline-none"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
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
      <span className="w-[42px] shrink-0 font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#555568]">
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
        "rounded-full border px-3 py-1.5 transition-colors duration-150",
        "font-[family-name:var(--font-geist-mono)] text-[10px] uppercase tracking-widest",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] focus-visible:ring-offset-1 focus-visible:ring-offset-[#09090f]",
        active
          ? "border-[#e8453c] bg-[#e8453c] text-[#F5F5F0]"
          : "border-[#1e1e2a] text-[#888899] hover:border-[#e8453c]/40 hover:text-[#F5F5F0]",
      )}
    >
      {children}
    </button>
  );
}

type ActiveFilterChip = {
  key: string;
  label: string;
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
        onFiltersChange({ decadeMin: DECADE_MIN, decadeMax: DECADE_MAX, page: 1 }),
    });
  }

  if (filters.nominationCount != null) {
    chips.push({
      key: "nominationCount",
      label: `${filters.nominationCount} nomination${filters.nominationCount === 1 ? "" : "s"}`,
      onRemove: () => onFiltersChange({ nominationCount: null, page: 1 }),
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
