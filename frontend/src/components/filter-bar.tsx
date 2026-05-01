"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { FilterState } from "@cineroll/types";

interface FilterBarProps {
  filters: FilterState;
  genres: string[];
  onFiltersChange: (updates: Partial<FilterState>) => void;
  className?: string;
}

const DECADE_MIN = 1900;
const DECADE_MAX = 2030;

export function FilterBar({
  filters,
  genres,
  onFiltersChange,
  className,
}: FilterBarProps) {
  return (
    <div
      role="search"
      aria-label="Filter films"
      className={cn("flex flex-wrap items-end gap-4", className)}
    >
      <div className="min-w-[200px] flex-1">
        <Input
          label="Search"
          placeholder="Title, director, cast…"
          value={filters.search}
          onChange={(e) =>
            onFiltersChange({ search: e.target.value, page: 1 })
          }
          leftIcon={<Search className="h-4 w-4" />}
          aria-label="Search films"
        />
      </div>

      <div className="w-[180px]">
        <label
          id="genre-label"
          className="mb-1.5 block text-sm font-medium text-zinc-300"
        >
          Genre
        </label>
        <Select
          {...(filters.genre ? { value: filters.genre } : {})}
          onValueChange={(value) =>
            onFiltersChange({
              genre: value === "_all" ? "" : value,
              page: 1,
            })
          }
          aria-labelledby="genre-label"
        >
          <SelectTrigger>
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

      <div className="flex min-w-[200px] flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label id="decade-label" className="text-sm font-medium text-zinc-300">
            Decade
          </label>
          <span className="tabular-nums text-xs text-zinc-500">
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
  );
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
      <SliderPrimitive.Track className="relative h-px w-full grow overflow-hidden rounded-full bg-zinc-800">
        <SliderPrimitive.Range className="absolute h-full bg-amber-400" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        aria-label={`Minimum decade: ${value[0]}`}
        className={cn(
          "block h-3.5 w-3.5 rounded-full border-2 border-amber-400 bg-zinc-950",
          "transition-transform duration-100 hover:scale-125 hover:border-amber-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
          "disabled:pointer-events-none disabled:opacity-50"
        )}
      />
      <SliderPrimitive.Thumb
        aria-label={`Maximum decade: ${value[1]}`}
        className={cn(
          "block h-3.5 w-3.5 rounded-full border-2 border-amber-400 bg-zinc-950",
          "transition-transform duration-100 hover:scale-125 hover:border-amber-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
          "focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
          "disabled:pointer-events-none disabled:opacity-50"
        )}
      />
    </SliderPrimitive.Root>
  );
}
