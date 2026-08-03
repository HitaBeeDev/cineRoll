import type { FilterState } from "@cineroll/types";
import { MultiSelect } from "@/components/ui/multi-select";
import { formatGenre } from "@/lib/format";
import { PanelBand } from "@/components/browse/panel-band";
import { PanelSection } from "@/components/browse/panel-section";
import { ChipGroup } from "@/components/browse/chip-group";
import { FilterChip } from "@/components/browse/filter-chip";
import { FilterSelect } from "@/components/browse/filter-select";
import { ThresholdChips } from "@/components/browse/threshold-chips";
import { CONTENT_TYPE_OPTIONS } from "@/lib/browse/options";
import { toggleValue } from "@/lib/browse/filter-updates";
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

const RUNTIME_OPTIONS = [
  { value: 90, label: "≤ 90m" },
  { value: 120, label: "≤ 2h" },
  { value: 150, label: "≤ 2h30" },
  { value: 180, label: "≤ 3h" },
];

/** What the film IS: format, subject, era, and how well it scored. */
export function FilmBand({
  filters,
  setFilters,
  genres,
  releaseYears,
}: {
  filters: FilterState;
  setFilters: SetFilters;
  genres: string[];
  releaseYears: number[];
}) {
  const decades = decadesFromYears(releaseYears);
  const selectedDecade = yearRangeToDecade(filters);
  const yearOptions = releaseYears.map((y) => ({ value: String(y), label: String(y) }));

  return (
    <PanelBand label="Film">
      <PanelSection label="Content Type">
        {/* Multi-select: nothing highlighted already means every type, so there
            is no "All" chip to keep in sync with the selection. */}
        <ChipGroup label="Content type" multiple>
          {CONTENT_TYPE_OPTIONS.map(({ value, label }) => (
            <FilterChip
              key={value}
              multiple
              active={filters.contentTypes.includes(value)}
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
          ariaLabel="Genre"
          selected={filters.genres}
          onChange={(vals) => setFilters({ genres: vals, page: 1 })}
          placeholder="Any genre"
          searchable
          triggerClassName="w-full"
          options={genres.map((g) => ({ value: g, label: formatGenre(g) }))}
        />
      </PanelSection>

      <PanelSection label="Decade">
        <FilterSelect
          value={selectedDecade != null ? String(selectedDecade) : ANY_YEAR}
          // Picking a decade writes its ten years into the range beside it;
          // "Any decade" clears the bounds outright.
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
      </PanelSection>

      {/* The heading and the dash convey the range, so the selects need no
          From/To captions (kept as aria-labels). */}
      <PanelSection label="Year Range">
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
      </PanelSection>

      <PanelSection label="IMDb Rating">
        <ThresholdChips
          ariaLabel="Minimum IMDb rating"
          options={IMDB_OPTIONS}
          // 0 is this filter's "unset" in FilterState, not a rating anyone picks.
          value={filters.imdbRatingMin || null}
          onSelect={(next) => setFilters({ imdbRatingMin: next ?? 0, page: 1 })}
        />
      </PanelSection>

      <PanelSection label="Max Runtime">
        <ThresholdChips
          ariaLabel="Maximum runtime"
          options={RUNTIME_OPTIONS}
          value={filters.runtimeMax}
          onSelect={(next) => setFilters({ runtimeMax: next, page: 1 })}
        />
      </PanelSection>
    </PanelBand>
  );
}
