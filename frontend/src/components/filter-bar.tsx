"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
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
  onFiltersChange: (updates: Partial<FilterState>) => void;
  onClearFilters: () => void;
  className?: string;
}

const DECADE_MIN = 1900;
const DECADE_MAX = 2030;

export function FilterBar({
  filters,
  genres,
  categories,
  onFiltersChange,
  onClearFilters,
  className,
}: FilterBarProps) {
  const activeChips = getActiveFilterChips(filters, onFiltersChange);

  return (
    <div
      aria-label="Filter films"
      className={cn(
        "w-full rounded-lg border border-border bg-surface/60 p-5 flex flex-col gap-5",
        className
      )}
    >
      {/* Person search */}
      <Input
        label="Search cast, director, or person"
        placeholder="e.g. Meryl Streep, Spielberg…"
        value={filters.person}
        onChange={(e) => onFiltersChange({ person: e.target.value, page: 1 })}
        leftIcon={<Search className="h-4 w-4" />}
      />

      {/* Award body */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">Award</span>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: "both", label: "Both" },
              { value: "oscar", label: "Oscar" },
              { value: "goldenglobe", label: "Golden Globe" },
            ] as { value: AwardBody; label: string }[]
          ).map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={filters.awardBody === value}
              onClick={() => onFiltersChange({ awardBody: value, page: 1 })}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium border transition-colors",
                filters.awardBody === value
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-transparent text-muted border-border hover:border-muted hover:text-foreground"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Won / Nominated */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-foreground">Status</span>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "All", winnerOnly: false, nominatedOnly: false },
            { label: "Won", winnerOnly: true, nominatedOnly: false },
            { label: "Nominated", winnerOnly: false, nominatedOnly: true },
          ].map(({ label, winnerOnly, nominatedOnly }) => {
            const active =
              filters.winnerOnly === winnerOnly &&
              filters.nominatedOnly === nominatedOnly;
            return (
              <button
                key={label}
                type="button"
                aria-pressed={active}
                onClick={() =>
                  onFiltersChange({ winnerOnly, nominatedOnly, page: 1 })
                }
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium border transition-colors",
                  active
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-transparent text-muted border-border hover:border-muted hover:text-foreground"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category + Award Year */}
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[180px]">
          <label
            id="category-label"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Category
          </label>
          <Select
            value={filters.category || "_all"}
            onValueChange={(value) =>
              onFiltersChange({
                category: value === "_all" ? "" : value,
                page: 1,
              })
            }
          >
            <SelectTrigger aria-labelledby="category-label">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-[130px]">
          <label
            htmlFor="award-year-filter"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Award Year
          </label>
          <input
            id="award-year-filter"
            type="number"
            min={1927}
            max={2030}
            placeholder="e.g. 1994"
            value={filters.awardYear ?? ""}
            onChange={(e) =>
              onFiltersChange({
                awardYear: e.target.value ? Number(e.target.value) : null,
                page: 1,
              })
            }
            className={cn(
              "w-full rounded-lg border border-border bg-surface px-3 py-2",
              "text-sm text-foreground placeholder:text-muted/70",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              "transition-colors"
            )}
          />
        </div>
      </div>

      {/* Genre + Decade */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="w-[180px]">
          <label
            id="genre-label"
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            Genre
          </label>
          <Select
            value={filters.genre || "_all"}
            onValueChange={(value) =>
              onFiltersChange({
                genre: value === "_all" ? "" : value,
                page: 1,
              })
            }
          >
            <SelectTrigger aria-labelledby="genre-label">
              <SelectValue placeholder="All genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all">All genres</SelectItem>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-1 min-w-[200px] flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              id="decade-label"
              className="text-sm font-medium text-foreground"
            >
              Decade
            </label>
            <span className="tabular-nums text-xs text-muted">
              {filters.decadeMin}–{filters.decadeMax}
            </span>
          </div>
          <DecadeRangeSlider
            min={DECADE_MIN}
            max={DECADE_MAX}
            value={[filters.decadeMin, filters.decadeMax]}
            onValueChange={([decadeMin, decadeMax]) =>
              onFiltersChange({ decadeMin, decadeMax, page: 1 })
            }
            aria-labelledby="decade-label"
          />
        </div>
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-foreground">
              Active filters
            </span>
            <button
              type="button"
              onClick={onClearFilters}
              className={cn(
                "text-xs font-medium text-muted transition-colors",
                "hover:text-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
              )}
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onRemove}
                className={cn(
                  "inline-flex h-7 items-center gap-1.5 rounded-full border border-border",
                  "bg-background px-2.5 text-xs font-medium text-foreground",
                  "transition-colors hover:border-muted hover:bg-surface-muted",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                )}
                aria-label={`Remove ${chip.label} filter`}
              >
                <span>{chip.label}</span>
                <X className="h-3 w-3 text-muted" aria-hidden />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
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

  if (filters.person.trim()) {
    chips.push({
      key: "person",
      label: `Person: ${filters.person.trim()}`,
      onRemove: () => onFiltersChange({ person: "", page: 1 }),
    });
  }

  if (filters.awardBody !== "both") {
    chips.push({
      key: "awardBody",
      label: filters.awardBody === "oscar" ? "Oscar" : "Golden Globe",
      onRemove: () => onFiltersChange({ awardBody: "both", page: 1 }),
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
      label: `Award year: ${filters.awardYear}`,
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
      label: `${filters.decadeMin}-${filters.decadeMax}`,
      onRemove: () =>
        onFiltersChange({
          decadeMin: DECADE_MIN,
          decadeMax: DECADE_MAX,
          page: 1,
        }),
    });
  }

  return chips;
}

interface DecadeRangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  "aria-labelledby"?: string;
}

function DecadeRangeSlider({
  min,
  max,
  value,
  onValueChange,
  "aria-labelledby": ariaLabelledBy,
}: DecadeRangeSliderProps) {
  return (
    <SliderPrimitive.Root
      min={min}
      max={max}
      step={10}
      value={value}
      onValueChange={(vals) => onValueChange(vals as [number, number])}
      aria-labelledby={ariaLabelledBy}
      className="relative flex h-10 w-full touch-none select-none items-center"
    >
      <SliderPrimitive.Track className="relative h-px w-full grow overflow-hidden rounded-full bg-border">
        <SliderPrimitive.Range className="absolute h-full bg-accent" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        aria-label={`Minimum decade: ${value[0]}`}
        className={cn(
          "block h-3.5 w-3.5 rounded-full border-2 border-accent bg-background",
          "transition-transform duration-100 hover:scale-125",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-50"
        )}
      />
      <SliderPrimitive.Thumb
        aria-label={`Maximum decade: ${value[1]}`}
        className={cn(
          "block h-3.5 w-3.5 rounded-full border-2 border-accent bg-background",
          "transition-transform duration-100 hover:scale-125",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-50"
        )}
      />
    </SliderPrimitive.Root>
  );
}
