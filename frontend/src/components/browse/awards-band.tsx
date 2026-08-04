import type { FacetCounts, FilterState } from "@cineroll/types";
import { MultiSelect } from "@/components/ui/multi-select";
import { PanelBand } from "@/components/browse/panel-band";
import { CONTROL_WIDTH } from "@/components/browse/panel-section/control-width";
import { PanelSection } from "@/components/browse/panel-section/panel-section";
import { FilterSelect } from "@/components/browse/filter-select";
import { ThresholdChips } from "@/components/browse/threshold-chips";
import { categoryOptions } from "@/lib/browse/facet-options/category-options";
import { reachableYears } from "@/lib/browse/facet-options/reachable-years";
import { ANY_YEAR } from "@/lib/browse/year-range/any-year";
import { parseYear } from "@/lib/browse/year-range/parse-year";
import { setCeremonyYearMax } from "@/lib/browse/year-range/set-ceremony-year-max";
import { setCeremonyYearMin } from "@/lib/browse/year-range/set-ceremony-year-min";
import type { SetFilters } from "@/lib/browse/filter-descriptors/set-filters";

/**
 * There is no win-count control here, and there is no longer one anywhere in the
 * panel. It arrived as three rows (minimum nominations, minimum wins, maximum
 * wins), was folded to one, and is now gone — each step for the same reason,
 * which is that every question it could ask is already asked better elsewhere:
 *
 * - How many nominations is what the "Most nominations" sort is for. Every film
 *   in the catalogue was nominated for something, so the filter could only ever
 *   be a ladder, and page one of that sort is the top of the ladder, ranked.
 * - At least N wins repeats the Award Result strip in the sticky bar, and repeats
 *   it inexactly: `winnerOnly` means "won at the selected ceremony", a win count
 *   sums every body. Two different questions, told apart by a grey 11px hint.
 * - Never won was the last one standing, and it is a genuine question (54% of the
 *   catalogue) — but a five-chip row whose only load-bearing chip is the first is
 *   four chips of decoration, and it sat in a band about which award, from whom,
 *   in which year, saying something about arithmetic instead.
 *
 * `winsMin` / `winsMax` still exist end to end — in FilterState, in the URL, in
 * the API, and on the daily picks, which uses `winsMax: 0` to build its
 * never-won slot. A link carrying them still filters, and the active-filter chip
 * bar still shows and removes them. What is gone is a control in the panel.
 */

/**
 * Consensus across juries, which is the one question a four-ceremony catalogue
 * can answer and a single-ceremony list cannot: the Oscars, the Golden Globes,
 * Cannes and Berlin do not share a taste, so a title all of them noticed was
 * noticed for something other than the thing any one of them rewards.
 *
 * No "1+": every film here was recognised by at least one ceremony, so it would
 * select the catalogue. The scale ends at 4 because there are four bodies — and
 * the last step is a real one, with 315 films at three and exactly 2 at all four.
 */
const CEREMONY_COUNT_OPTIONS = [
  { value: 2, label: "2+" },
  { value: 3, label: "3+" },
  { value: 4, label: "All 4" },
];

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
    /* One row of three, which is the whole band now that the counting is gone.

       "Recognised by" leads it. It used to be last — bottom left, alone in a row
       two thirds empty — while "how many nominations / wins / at most wins" took
       the middle. That had it backwards: consensus across four juries is the one
       question this catalogue can answer that a single-ceremony list cannot, and
       the win counts were the most specialist thing on the panel. The
       differentiator opens the band; the arithmetic left the building. */
    <PanelBand label="Awards" activeCount={activeCount} collapsible={collapsible}>
      <PanelSection
        label="Recognised By"
        hint="how many of the four ceremonies"
        emphasis="primary"
        startsRow
      >
        <ThresholdChips
          ariaLabel="Minimum number of ceremonies that recognised the film"
          options={CEREMONY_COUNT_OPTIONS}
          value={filters.ceremonyCount}
          onSelect={(next) => setFilters({ ceremonyCount: next, page: 1 })}
        />
      </PanelSection>

      <PanelSection label="Award Category" emphasis="primary">
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
          in the band below: "the Oscars of the 1970s" is an obvious thing to ask
          of an award catalogue and a one-value select could not express it.
          Leaving both bounds on the same year still asks for one ceremony. */}
      <PanelSection label="Ceremony Year" emphasis="primary">
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
    </PanelBand>
  );
}
