"use client";

import { cn } from "@/lib/utils";
import type { FilterState } from "@cineroll/types";
import { getActiveFilterChips } from "@/components/filter-bar/active-chips";
import { buildRollRecipe } from "@/components/filter-bar/roll-recipe";
import { AwardsRow } from "@/components/filter-bar/awards-row";
import { StatusRow } from "@/components/filter-bar/status-row";
import { TypeRow } from "@/components/filter-bar/type-row";
import { GenreRow } from "@/components/filter-bar/genre-row";
import { ActiveFilterChips } from "@/components/filter-bar/active-filter-chips";
import { RollRecipeLine } from "@/components/filter-bar/roll-recipe-line";

interface FilterBarProps {
  filters: FilterState;
  genres: string[];
  onFiltersChange: (updates: Partial<FilterState>) => void;
  onClearFilters: () => void;
  className?: string;
}

/**
 * "Build Your Roll" filter panel: composes the award/status/type/genre rows, the
 * removable active-filter chips, and the shareable roll-recipe summary. Holds no
 * presentation of its own beyond layout — chip and recipe logic live in modules.
 */
export function FilterBar({
  filters,
  genres,
  onFiltersChange,
  onClearFilters,
  className,
}: FilterBarProps) {
  const activeChips = getActiveFilterChips(filters, onFiltersChange);
  const recipe = buildRollRecipe(filters);

  return (
    <div aria-label="Filter films" className={cn("flex min-w-0 flex-col gap-3", className)}>
      <p className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.3em] text-[#9a9aac]">
        Build Your Roll
      </p>

      <AwardsRow filters={filters} onFiltersChange={onFiltersChange} />
      <StatusRow filters={filters} onFiltersChange={onFiltersChange} />
      <TypeRow filters={filters} onFiltersChange={onFiltersChange} />
      <GenreRow filters={filters} genres={genres} onFiltersChange={onFiltersChange} />

      <ActiveFilterChips chips={activeChips} onClearFilters={onClearFilters} />
      <RollRecipeLine filters={filters} recipe={recipe} />
    </div>
  );
}
