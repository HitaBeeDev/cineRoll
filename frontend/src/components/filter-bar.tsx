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

const DECADE_OPTIONS: { value: string; label: string }[] = [
  { value: "_any", label: "Any" },
  ...[1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020].map((d) => ({
    value: `${d}-${d + 9}`,
    label: `${d}s`,
  })),
];

const PRESETS: { label: string; filters: Partial<FilterState> }[] = [
  { label: "Something from the 90s", filters: { decadeMin: 1990, decadeMax: 1999 } },
  { label: "Cannes Palme d'Or", filters: { awardBody: "cannes" as AwardBody, winnerOnly: true } },
  { label: "Best Picture Winner", filters: { awardBody: "oscar" as AwardBody, winnerOnly: true } },
  { label: "Under 2 Hours", filters: { imdbRatingMin: 6 } },
  { label: "Hidden Gem", filters: { imdbRatingMin: 7.5 } },
  { label: "GG Drama Winner", filters: { awardBody: "goldenglobe" as AwardBody, winnerOnly: true } },
];

export function FilterBar({
  filters,
  genres,
  onFiltersChange,
  onClearFilters,
  className,
}: FilterBarProps) {
  const activeChips = getActiveFilterChips(filters, onFiltersChange);

  const hasDecadeFilter =
    filters.decadeMin !== DECADE_MIN || filters.decadeMax !== DECADE_MAX;
  const decadeValue = hasDecadeFilter
    ? `${filters.decadeMin}-${filters.decadeMax}`
    : "_any";

  return (
    <div aria-label="Filter films" className={cn("flex flex-col gap-4", className)}>

      {/* BODY row */}
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

      {/* STATUS row */}
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

      {/* DECADE + GENRE selects */}
      <div className="flex gap-3">
        <div className="flex-1">
          <span className="mb-1.5 block font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#555568]">
            Decade
          </span>
          <Select
            value={decadeValue}
            onValueChange={(val) => {
              if (val === "_any") {
                onFiltersChange({
                  decadeMin: DECADE_MIN,
                  decadeMax: DECADE_MAX,
                  page: 1,
                });
              } else {
                const parts = val.split("-");
                const min = parts[0] !== undefined ? Number(parts[0]) : DECADE_MIN;
                const max = parts[1] !== undefined ? Number(parts[1]) : DECADE_MAX;
                onFiltersChange({ decadeMin: min, decadeMax: max, page: 1 });
              }
            }}
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
              {DECADE_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <span className="mb-1.5 block font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest text-[#555568]">
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

      {/* PRESET tags */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map(({ label, filters: presetFilters }) => (
          <button
            key={label}
            type="button"
            onClick={() => onFiltersChange({ ...presetFilters, page: 1 })}
            className={cn(
              "rounded-full border border-[#1e1e2a] px-3 py-1.5",
              "font-[family-name:var(--font-geist-mono)] text-[9px] uppercase tracking-widest",
              "text-[#555568] transition-colors duration-150",
              "hover:border-[#e8453c]/40 hover:text-[#F5F5F0]",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#e8453c]",
            )}
          >
            {label}
          </button>
        ))}
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
            onClick={onClearFilters}
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
          ? "border-[#e8453c] bg-[#e8453c] text-white"
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

  if (filters.decadeMin !== DECADE_MIN || filters.decadeMax !== DECADE_MAX) {
    chips.push({
      key: "decade",
      label: `${filters.decadeMin}–${filters.decadeMax}`,
      onRemove: () =>
        onFiltersChange({ decadeMin: DECADE_MIN, decadeMax: DECADE_MAX, page: 1 }),
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
