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
 * One row for how decorated a film is, where there used to be three — minimum
 * nominations, minimum wins, maximum wins, fourteen chips and three captions for
 * what is really one axis running from "won nothing" upward.
 *
 * What each of the three was actually worth:
 *
 * - Nominations answered a question the "Most nominations" sort answers better.
 *   Every film here was nominated for something (0 of 9,180 were not), so the row
 *   could only ever be a ladder, and a ladder is what an ordering is for: page one
 *   of that sort IS the "most nominated" answer, already ranked.
 *
 * - Minimum wins repeated the Award Result strip in the sticky bar. Not exactly,
 *   which was the problem: `winnerOnly` lives inside the award-row EXISTS and so
 *   means "won at the selected ceremony", while `winsMin` sums every body — two
 *   different questions on one screen, told apart by a grey 11px hint. With no
 *   ceremony selected they are the same filter, twice. The top of the ladder was
 *   sort territory besides: 10+ wins is 28 films out of 9,180.
 *
 * - The cap was the one worth keeping, and only at zero. "Nominated and went home
 *   empty" is 54% of the catalogue and nothing else in the UI can name it — not
 *   even the Nominated segment, which matches any film with an award row, i.e.
 *   all of them. The ≤1 / ≤2 / ≤5 steps above it are hidden-gem tuning, too fine
 *   for a browse panel; `winsMax` still takes them from the API.
 *
 * So: never-won at one end, a short ladder above it, and "at least one win" left
 * to the Winner segment that already says it — which is what stops the two
 * controls meaning subtly different things side by side.
 */
const AWARDS_WON_OPTIONS = [
  { value: 0, label: "Never won" },
  { value: 2, label: "2+" },
  { value: 3, label: "3+" },
  { value: 5, label: "5+" },
  { value: 10, label: "10+" },
];

/**
 * The row's single value, folded out of the two fields behind it: 0 is the cap at
 * zero, anything else is the floor. They are never both set, so the pair cannot
 * contradict itself and there is no crossing to guard against.
 */
function awardsWonValue(filters: FilterState): number | null {
  if (filters.winsMax === 0) return 0;
  return filters.winsMin ?? null;
}

function setAwardsWon(next: number | null): Partial<FilterState> {
  if (next === null) return { winsMin: null, winsMax: null };
  if (next === 0) return { winsMin: null, winsMax: 0 };

  return { winsMin: next, winsMax: null };
}

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
    /* Two rows of three, and which control gets which slot is the argument the
       band is making.

       "Recognised by" leads. It was last here — bottom left, alone in a row two
       thirds empty — while "how many nominations / wins / at most wins" took the
       middle. That had it backwards twice over: consensus across four juries is
       the one question this catalogue can answer that a single-ceremony list
       cannot, and the win-count trio is the most specialist thing in the band.
       The differentiator now opens the panel, and the counting follows it. */
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

      {/* The hint is not decoration: this counts across all four ceremonies
          whatever is selected above, so "5+" with Cannes selected means "a Cannes
          film with five wins anywhere", not five at Cannes. Unsaid, the number is
          quietly the wrong one. */}
      <PanelSection label="Awards Won" hint="across all ceremonies" startsRow>
        <ThresholdChips
          ariaLabel="Total award wins across all ceremonies"
          options={AWARDS_WON_OPTIONS}
          value={awardsWonValue(filters)}
          onSelect={(next) => setFilters({ ...setAwardsWon(next), page: 1 })}
        />
      </PanelSection>
    </PanelBand>
  );
}
