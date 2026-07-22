import type { FilterState } from "@cineroll/types";
import { FilterRow } from "@/components/filter-bar/filter-row";
import { PillToggle } from "@/components/filter-bar/pill-toggle";
import { AwardBodyIcon } from "@/components/filter-bar/award-body-icon";
import { AWARD_BODIES, toggleValue } from "@/components/filter-bar/constants";

/** Awards row — bodies are multi-select (combine Oscar + Golden Globe, etc.);
 *  "All" clears the selection. */
export function AwardsRow({
  filters,
  onFiltersChange,
}: {
  filters: FilterState;
  onFiltersChange: (updates: Partial<FilterState>) => void;
}) {
  return (
    <FilterRow label="Awards">
      <PillToggle
        active={filters.awardBodies.length === 0}
        onClick={() => onFiltersChange({ awardBodies: [], page: 1 })}
      >
        All
      </PillToggle>
      {AWARD_BODIES.map(({ value, label }) => (
        <PillToggle
          key={value}
          active={filters.awardBodies.includes(value)}
          onClick={() =>
            onFiltersChange({ awardBodies: toggleValue(filters.awardBodies, value), page: 1 })
          }
        >
          <span className="inline-flex items-center gap-1">
            <AwardBodyIcon body={value} />
            {label}
          </span>
        </PillToggle>
      ))}
    </FilterRow>
  );
}
