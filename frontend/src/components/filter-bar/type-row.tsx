import type { FilterState } from "@cineroll/types";
import { FilterRow } from "@/components/filter-bar/filter-row";
import { PillToggle } from "@/components/filter-bar/pill-toggle";
import { CONTENT_TYPES, toggleValue } from "@/components/filter-bar/constants";

/** Type row — multi-select content types; "All" clears the selection. */
export function TypeRow({
  filters,
  onFiltersChange,
}: {
  filters: FilterState;
  onFiltersChange: (updates: Partial<FilterState>) => void;
}) {
  return (
    <FilterRow label="Type">
      <PillToggle
        active={filters.contentTypes.length === 0}
        onClick={() => onFiltersChange({ contentTypes: [], page: 1 })}
      >
        All
      </PillToggle>
      {CONTENT_TYPES.map(({ value, label }) => (
        <PillToggle
          key={value}
          active={filters.contentTypes.includes(value)}
          onClick={() => onFiltersChange({ contentTypes: toggleValue(filters.contentTypes, value), page: 1 })}
        >
          {label}
        </PillToggle>
      ))}
    </FilterRow>
  );
}
