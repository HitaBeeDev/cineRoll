import type { FacetCounts, FilterState } from "@cineroll/types";
import { MultiSelect } from "@/components/ui/multi-select";
import { formatGenre } from "@/lib/format";
import { PanelBand } from "@/components/browse/panel-band";
import { CONTROL_WIDTH, PanelSection } from "@/components/browse/panel-section";
import { ChipGroup } from "@/components/browse/chip-group";
import { FilterChip } from "@/components/browse/filter-chip";
import { FilterSelect } from "@/components/browse/filter-select";
import { ThresholdChips } from "@/components/browse/threshold-chips";
import { CONTENT_TYPE_OPTIONS } from "@/lib/browse/options";
import { toggleValue } from "@/lib/browse/filter-updates";
import { setRuntimeMax, setRuntimeMin } from "@/lib/browse/bounds";
import { countOf, reachableOptions, reachableYears } from "@/lib/browse/facet-options";
import {
  ANY_YEAR,
  decadeToYearRange,
  decadesFromYears,
  parseYear,
  setYearMax,
  setYearMin,
  yearRangeToDecade,
} from "@/lib/browse/year-range";
import type { SetFilters } from "@/lib/browse/filter-descriptors";

const IMDB_OPTIONS = [6, 6.5, 7, 7.5, 8, 8.5, 9].map((r) => ({ value: r, label: `${r}+` }));

const RT_OPTIONS = [50, 60, 70, 80, 90, 95].map((s) => ({ value: s, label: `${s}%+` }));

const RUNTIME_MAX_OPTIONS = [
  { value: 90, label: "≤ 90m" },
  { value: 120, label: "≤ 2h" },
  { value: 150, label: "≤ 2h30" },
  { value: 180, label: "≤ 3h" },
];

/**
 * The floor the cap never had. It starts at 40m because that is where the
 * catalogue's shorts end and its features begin — "≥ 40m" is how you ask for a
 * film rather than a nominated short, which no other control here says. Above
 * that it mirrors the caps, so a min and a max chosen from the two rows read as
 * one range.
 */
const RUNTIME_MIN_OPTIONS = [
  { value: 40, label: "≥ 40m" },
  { value: 90, label: "≥ 90m" },
  { value: 120, label: "≥ 2h" },
  { value: 150, label: "≥ 2h30" },
];

/** What the film IS: format, subject, era, and how well it scored. */
export function FilmBand({
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
  const genreOptions = reachableOptions(counts.genres, filters.genres, formatGenre);

  // Both bounds read from one list, so both are protected: narrowing one must
  // never strand the other on a year that has left the list holding it.
  const releaseYears = reachableYears(counts.releaseYears, filters.yearMin, filters.yearMax);
  const decades = decadesFromYears(releaseYears.map(({ year }) => year));
  const selectedDecade = yearRangeToDecade(filters);
  // No per-year counts on the bounds: these pick the ends of a range, and a count
  // for the single year 1994 says nothing about what "1994 – 2003" would return.
  const yearOptions = releaseYears.map(({ year }) => ({
    value: String(year),
    label: String(year),
  }));

  return (
    /* One pair of controls per row, each pair answering one question: what the
       film IS, when it is from, how well it scored. The controls in a row are
       siblings rather than neighbours-by-accident, which is what the old span
       juggling produced. The pairs sit in the panel's shared column track (see
       PanelSection's `startsRow`), so they stay aligned with the bands above and
       below rather than running on a grid of their own. */
    <PanelBand label="Film" activeCount={activeCount} collapsible={collapsible}>
      {/* Nature — what the film is. */}
      <PanelSection label="Content Type" startsRow>
        {/* Multi-select: nothing highlighted already means every type, so there
            is no "All" chip to keep in sync with the selection. */}
        <ChipGroup>
          {CONTENT_TYPE_OPTIONS.map(({ value, label }) => (
            <FilterChip
              key={value}
              active={filters.contentTypes.includes(value)}
              count={countOf(counts.contentTypes, value)}
              onClick={() =>
                setFilters({ contentTypes: toggleValue(filters.contentTypes, value), page: 1 })
              }
            >
              {label}
            </FilterChip>
          ))}
        </ChipGroup>
      </PanelSection>

      <PanelSection label="Genre">
        <MultiSelect
          selected={filters.genres}
          onChange={(vals) => setFilters({ genres: vals, page: 1 })}
          placeholder="Any genre"
          searchable
          triggerClassName={CONTROL_WIDTH}
          options={genreOptions}
        />
      </PanelSection>

      {/* Time — when it is from, and how much of yours it takes. One heading for
          the era, because there is one filter: yearMin/yearMax. The decade select
          is a shortcut that writes ten years into the range below it and falls
          back to "Any decade" the moment those bounds are edited by hand — shown
          together, so the shortcut and what it did can't read as two competing
          era filters. The heading and the dash carry the range, so the bounds need
          no From/To captions (kept as aria-labels). */}
      <PanelSection label="Release Year" startsRow>
        <div className={`flex flex-col gap-2 ${CONTROL_WIDTH}`}>
          <FilterSelect
            value={selectedDecade != null ? String(selectedDecade) : ANY_YEAR}
            onValueChange={(val) => {
              const decade = parseYear(val);
              setFilters({
                ...(decade == null ? { yearMin: null, yearMax: null } : decadeToYearRange(decade)),
                page: 1,
              });
            }}
            placeholder="Any decade"
            ariaLabel="Decade"
            className="w-full text-[#b8b5c8]"
            options={[
              { value: ANY_YEAR, label: "Any decade" },
              ...decades.map((d) => ({ value: String(d), label: `${d}s` })),
            ]}
          />

          <div className="flex items-center gap-2">
            <FilterSelect
              value={filters.yearMin != null ? String(filters.yearMin) : ANY_YEAR}
              onValueChange={(val) => setFilters({ ...setYearMin(filters, parseYear(val)), page: 1 })}
              ariaLabel="Year from"
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
              value={filters.yearMax != null ? String(filters.yearMax) : ANY_YEAR}
              onValueChange={(val) => setFilters({ ...setYearMax(filters, parseYear(val)), page: 1 })}
              ariaLabel="Year to"
              className="w-full flex-1 text-[#b8b5c8]"
              options={[{ value: ANY_YEAR, label: "Any" }, ...yearOptions]}
            />
          </div>
        </div>
      </PanelSection>

      {/* Two bounds, one length: the cap alone could only ask for something
          short, and "a proper long one, but not a four-hour one" is the other
          half of the same question. They move each other out of the way rather
          than crossing into a range nothing can satisfy (see bounds.ts). */}
      <PanelSection label="Min Runtime">
        <ThresholdChips
          ariaLabel="Minimum runtime"
          options={RUNTIME_MIN_OPTIONS}
          value={filters.runtimeMin}
          onSelect={(next) => setFilters({ ...setRuntimeMin(filters, next), page: 1 })}
        />
      </PanelSection>

      <PanelSection label="Max Runtime">
        <ThresholdChips
          ariaLabel="Maximum runtime"
          options={RUNTIME_MAX_OPTIONS}
          value={filters.runtimeMax}
          onSelect={(next) => setFilters({ ...setRuntimeMax(filters, next), page: 1 })}
        />
      </PanelSection>

      {/* Scores — one question asked of two sources, so they sit side by side in
          the same control at the same width, not one here and one a band away. */}
      <PanelSection label="IMDb Rating" startsRow>
        <ThresholdChips
          ariaLabel="Minimum IMDb rating"
          options={IMDB_OPTIONS}
          // 0 is this filter's "unset" in FilterState, not a rating anyone picks.
          value={filters.imdbRatingMin || null}
          onSelect={(next) => setFilters({ imdbRatingMin: next ?? 0, page: 1 })}
        />
      </PanelSection>

      <PanelSection label="Rotten Tomatoes">
        <ThresholdChips
          ariaLabel="Minimum Rotten Tomatoes score"
          options={RT_OPTIONS}
          // 0 is this filter's "unset" in FilterState, not a score anyone picks.
          value={filters.rtScoreMin || null}
          onSelect={(next) => setFilters({ rtScoreMin: next ?? 0, page: 1 })}
        />
      </PanelSection>
    </PanelBand>
  );
}
