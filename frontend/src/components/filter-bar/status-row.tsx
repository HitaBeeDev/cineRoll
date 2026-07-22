import type { FilterState } from "@cineroll/types";
import { FilterRow } from "@/components/filter-bar/filter-row";
import { PillToggle } from "@/components/filter-bar/pill-toggle";

/** Status row — Any / Won / Nominated (single choice). */
export function StatusRow({
  filters,
  onFiltersChange,
}: {
  filters: FilterState;
  onFiltersChange: (updates: Partial<FilterState>) => void;
}) {
  return (
    <FilterRow label="Status">
      <PillToggle
        active={!filters.winnerOnly && !filters.nominatedOnly}
        onClick={() => onFiltersChange({ winnerOnly: false, nominatedOnly: false, page: 1 })}
      >
        Any
      </PillToggle>
      <PillToggle
        active={filters.winnerOnly}
        onClick={() => onFiltersChange({ winnerOnly: true, nominatedOnly: false, page: 1 })}
      >
        Won
      </PillToggle>
      <PillToggle
        active={filters.nominatedOnly && !filters.winnerOnly}
        onClick={() => onFiltersChange({ winnerOnly: false, nominatedOnly: true, page: 1 })}
      >
        Nominated
      </PillToggle>
    </FilterRow>
  );
}
