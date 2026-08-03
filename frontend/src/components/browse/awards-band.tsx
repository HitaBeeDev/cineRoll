import type { FacetCounts, FilterState } from "@cineroll/types";
import { MultiSelect } from "@/components/ui/multi-select";
import { PanelBand } from "@/components/browse/panel-band";
import { CONTROL_WIDTH, PanelSection } from "@/components/browse/panel-section";
import { FilterSelect } from "@/components/browse/filter-select";
import { ThresholdChips } from "@/components/browse/threshold-chips";
import { reachableOptions, reachableYears } from "@/lib/browse/facet-options";
import { ANY_YEAR } from "@/lib/browse/year-range";
import type { SetFilters } from "@/lib/browse/filter-descriptors";

const NOMINATION_OPTIONS = [1, 3, 5, 10, 20].map((n) => ({ value: n, label: `${n}+` }));

/**
 * The award band comes first because the awards ARE the catalogue — everything
 * below it narrows an award-defined set rather than defining one. It continues
 * the question the sticky row starts (which ceremony? winner or nominee?) with:
 * in which category, in which year, how decorated.
 */
export function AwardsBand({
  filters,
  setFilters,
  activeCount,
  counts,
}: {
  filters: FilterState;
  setFilters: SetFilters;
  activeCount: number;
  counts: FacetCounts;
}) {
  // The category list is what the facet counts change most. It used to hold every
  // category of every ceremony at once, so with Cannes selected most of it was a
  // choice that could only return nothing; it now holds what the selected
  // ceremonies actually award, each with the films behind it.
  const categoryOptions = reachableOptions(counts.categories, filters.categories, (c) => c);
  const awardYears = reachableYears(counts.awardYears, filters.awardYear);

  return (
    <PanelBand label="Awards" activeCount={activeCount}>
      <PanelSection label="Award Category">
        <MultiSelect
          ariaLabel="Award category"
          selected={filters.categories}
          onChange={(vals) => setFilters({ categories: vals, page: 1 })}
          placeholder="Any category"
          searchable
          triggerClassName={CONTROL_WIDTH}
          options={categoryOptions}
        />
      </PanelSection>

      <PanelSection label="Ceremony Year">
        <FilterSelect
          value={filters.awardYear != null ? String(filters.awardYear) : ANY_YEAR}
          onValueChange={(val) =>
            setFilters({ awardYear: val === ANY_YEAR ? null : Number(val), page: 1 })
          }
          placeholder="Any year"
          ariaLabel="Ceremony year"
          className={`${CONTROL_WIDTH} text-[#b8b5c8]`}
          options={[
            { value: ANY_YEAR, label: "Any year" },
            ...awardYears.map(({ year, count }) => ({
              value: String(year),
              label: String(year),
              count,
            })),
          ]}
        />
      </PanelSection>

      <PanelSection label="Min. Nominations">
        <ThresholdChips
          ariaLabel="Minimum total award nominations"
          options={NOMINATION_OPTIONS}
          value={filters.nominationCount}
          onSelect={(next) => setFilters({ nominationCount: next, page: 1 })}
        />
      </PanelSection>
    </PanelBand>
  );
}
