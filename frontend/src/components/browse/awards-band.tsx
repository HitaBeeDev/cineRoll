import type { FacetCounts, FilterState } from "@cineroll/types";
import { MultiSelect } from "@/components/ui/multi-select";
import { PanelBand } from "@/components/browse/panel-band";
import { CONTROL_WIDTH, PanelSection } from "@/components/browse/panel-section";
import { FilterSelect } from "@/components/browse/filter-select";
import { ThresholdChips } from "@/components/browse/threshold-chips";
import { categoryOptions, reachableYears } from "@/lib/browse/facet-options";
import {
  ANY_YEAR,
  parseYear,
  setCeremonyYearMax,
  setCeremonyYearMin,
} from "@/lib/browse/year-range";
import type { SetFilters } from "@/lib/browse/filter-descriptors";

/**
 * No "1+". Every film in the catalogue is here because it was nominated for
 * something — 0 of 9,180 have no nominations — so that chip selected the entire
 * catalogue, an option that cannot narrow anything sitting in a row whose whole
 * purpose is narrowing. The scale now starts where it starts to mean something.
 */
const NOMINATION_OPTIONS = [2, 3, 5, 10, 20].map((n) => ({ value: n, label: `${n}+` }));

/**
 * The award band comes first because the awards ARE the catalogue — everything
 * below it narrows an award-defined set rather than defining one. It continues
 * the question the sticky row starts (which ceremony? winner or nominee?) with:
 * in which category, in which years, how decorated.
 */
export function AwardsBand({
  filters,
  setFilters,
  activeCount,
  counts,
  collapsible = false,
}: {
  filters: FilterState;
  setFilters: SetFilters;
  activeCount: number;
  counts: FacetCounts;
  collapsible?: boolean;
}) {
  // The category list is what the facet counts change most. It used to hold every
  // category of every ceremony at once in one flat alphabetical run, so with
  // Cannes selected most of it was a choice that could only return nothing. It
  // now holds what the selected ceremonies actually award, grouped under them and
  // counted.
  const categories = categoryOptions(counts.categories, filters.categories);
  const awardYears = reachableYears(counts.awardYears, filters.awardYearMin, filters.awardYearMax);
  const yearOptions = awardYears.map(({ year }) => ({ value: String(year), label: String(year) }));

  return (
    <PanelBand label="Awards" activeCount={activeCount} collapsible={collapsible}>
      <PanelSection label="Award Category">
        <MultiSelect
          selected={filters.categories}
          onChange={(vals) => setFilters({ categories: vals, page: 1 })}
          placeholder="Any category"
          searchable
          triggerClassName={CONTROL_WIDTH}
          options={categories}
        />
      </PanelSection>

      {/* A range, not a single year, and shaped like the release-year bounds
          below it: "the Oscars of the 1970s" is an obvious thing to ask of an
          award catalogue and a one-value select could not express it. Leaving
          both bounds on the same year still asks for one ceremony. */}
      <PanelSection label="Ceremony Year">
        <div className={`flex items-center gap-2 ${CONTROL_WIDTH}`}>
          <FilterSelect
            value={filters.awardYearMin != null ? String(filters.awardYearMin) : ANY_YEAR}
            onValueChange={(val) =>
              setFilters({ ...setCeremonyYearMin(filters, parseYear(val)), page: 1 })
            }
            ariaLabel="Ceremony year from"
            className="w-full flex-1 text-[#b8b5c8]"
            options={[{ value: ANY_YEAR, label: "Any" }, ...yearOptions]}
          />
          <span
            className="font-[family-name:var(--font-geist-mono)] text-[12px] text-[#56515f]"
            aria-hidden
          >
            –
          </span>
          <FilterSelect
            value={filters.awardYearMax != null ? String(filters.awardYearMax) : ANY_YEAR}
            onValueChange={(val) =>
              setFilters({ ...setCeremonyYearMax(filters, parseYear(val)), page: 1 })
            }
            ariaLabel="Ceremony year to"
            className="w-full flex-1 text-[#b8b5c8]"
            options={[{ value: ANY_YEAR, label: "Any" }, ...yearOptions]}
          />
        </div>
      </PanelSection>

      {/* The hint is not decoration. This counts nominations across all four
          ceremonies whatever is selected above, so "5+" with Cannes selected
          means "a Cannes film with five nominations anywhere", not five at
          Cannes. Unsaid, the number is quietly the wrong one. */}
      <PanelSection label="Min. Nominations" hint="across all ceremonies">
        <ThresholdChips
          ariaLabel="Minimum total award nominations across all ceremonies"
          options={NOMINATION_OPTIONS}
          value={filters.nominationCount}
          onSelect={(next) => setFilters({ nominationCount: next, page: 1 })}
        />
      </PanelSection>
    </PanelBand>
  );
}
