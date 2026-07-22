import type { FilterState } from "@cineroll/types";
import { MultiSelect } from "@/components/ui/multi-select";
import { FilterRow } from "@/components/filter-bar/filter-row";

/** Genre row — a searchable multi-select of the available genres. */
export function GenreRow({
  filters,
  genres,
  onFiltersChange,
}: {
  filters: FilterState;
  genres: string[];
  onFiltersChange: (updates: Partial<FilterState>) => void;
}) {
  return (
    <FilterRow label="Genre">
      <MultiSelect
        ariaLabel="Genre"
        selected={filters.genres}
        onChange={(vals) => onFiltersChange({ genres: vals, page: 1 })}
        placeholder="All"
        searchable
        variant="pill"
        options={genres.map((genre) => ({ value: genre, label: genre }))}
      />
    </FilterRow>
  );
}
