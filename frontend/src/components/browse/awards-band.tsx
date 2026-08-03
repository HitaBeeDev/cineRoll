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
import { setWinsMax, setWinsMin } from "@/lib/browse/bounds";
import type { SetFilters } from "@/lib/browse/filter-descriptors";

/**
 * No "1+". Every film in the catalogue is here because it was nominated for
 * something — 0 of 9,180 have no nominations — so that chip selected the entire
 * catalogue, an option that cannot narrow anything sitting in a row whose whole
 * purpose is narrowing. The scale now starts where it starts to mean something.
 */
const NOMINATION_OPTIONS = [2, 3, 5, 10, 20].map((n) => ({ value: n, label: `${n}+` }));

/**
 * Wins start at 1+, where nominations cannot: 54% of the catalogue never won
 * anything, so "at least one win" is the single most discriminating cut on this
 * band — and the reason the two scales don't share a set of thresholds. The top
 * of the range is lower too, because 10+ wins is already only 28 films.
 */
const WIN_OPTIONS = [1, 2, 3, 5, 10].map((n) => ({ value: n, label: `${n}+` }));

/**
 * The other end of the wins scale — and where the interesting question is asked
 * from below rather than above. "None" is the whole point of it: 54% of the
 * catalogue was nominated and went home empty, a set nothing else in the panel
 * can name. The caps above it are for narrowing that idea rather than dropping
 * it — "won a little, not everything".
 */
const WIN_MAX_OPTIONS = [
  { value: 0, label: "None" },
  { value: 1, label: "≤ 1" },
  { value: 2, label: "≤ 2" },
  { value: 5, label: "≤ 5" },
];

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
    <PanelBand label="Awards" activeCount={activeCount} collapsible={collapsible}>
      <PanelSection label="Award Category" startsRow>
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

      {/* Nominated how often, and won how often — one question about a film's
          standing asked twice, so the two scales sit side by side in the same
          control, like the IMDb and Rotten Tomatoes pair in the band below.
          The hints are not decoration: both count across all four ceremonies
          whatever is selected above, so "5+" with Cannes selected means "a Cannes
          film with five nominations anywhere", not five at Cannes. Unsaid, the
          number is quietly the wrong one. */}
      <PanelSection label="Min. Nominations" hint="across all ceremonies" startsRow>
        <ThresholdChips
          ariaLabel="Minimum total award nominations across all ceremonies"
          options={NOMINATION_OPTIONS}
          value={filters.nominationCount}
          onSelect={(next) => setFilters({ nominationCount: next, page: 1 })}
        />
      </PanelSection>

      <PanelSection label="Min. Wins" hint="across all ceremonies">
        <ThresholdChips
          ariaLabel="Minimum total award wins across all ceremonies"
          options={WIN_OPTIONS}
          value={filters.winsMin}
          onSelect={(next) => setFilters({ ...setWinsMin(filters, next), page: 1 })}
        />
      </PanelSection>

      {/* The cap completes the pair the floor started, and turns this row from
          "how decorated" into "how decorated, between here and here" — which is
          how a nominee that never won gets found at all. The two bounds move each
          other out of the way rather than crossing (see bounds.ts). */}
      <PanelSection label="Max. Wins" hint="across all ceremonies">
        <ThresholdChips
          ariaLabel="Maximum total award wins across all ceremonies"
          options={WIN_MAX_OPTIONS}
          value={filters.winsMax}
          onSelect={(next) => setFilters({ ...setWinsMax(filters, next), page: 1 })}
        />
      </PanelSection>

      <PanelSection label="Recognised By" hint="how many of the four ceremonies" startsRow>
        <ThresholdChips
          ariaLabel="Minimum number of ceremonies that recognised the film"
          options={CEREMONY_COUNT_OPTIONS}
          value={filters.ceremonyCount}
          onSelect={(next) => setFilters({ ceremonyCount: next, page: 1 })}
        />
      </PanelSection>
    </PanelBand>
  );
}
