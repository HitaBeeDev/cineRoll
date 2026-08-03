import type { FilterState } from "@cineroll/types";
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
  activeCount,
  genres,
  releaseYears,
}: {
  filters: FilterState;
  setFilters: SetFilters;
  activeCount: number;
  genres: string[];
  releaseYears: number[];
}) {
  const decades = decadesFromYears(releaseYears);
  const selectedDecade = yearRangeToDecade(filters);
  const yearOptions = releaseYears.map((y) => ({ value: String(y), label: String(y) }));

  return (
    <PanelBand label="Film" activeCount={activeCount}>
      <PanelSection label="Content Type" span={2}>
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
          triggerClassName={CONTROL_WIDTH}
          options={genres.map((g) => ({ value: g, label: formatGenre(g) }))}
        />
      </PanelSection>

      {/* One heading, because there is one filter: yearMin/yearMax. The decade
          select is a shortcut that writes ten years into the range below it and
          falls back to "Any decade" the moment those bounds are edited by hand —
          shown together, so the shortcut and what it did can't read as two
          competing era filters. The heading and the dash carry the range, so the
          bounds need no From/To captions (kept as aria-labels). */}
      <PanelSection label="Release Year">
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

      {/* The two score filters are one question asked of two sources, so they
          are the same control, the same width, stacked in the same columns —
          not one here and one in another band. */}
      <PanelSection label="IMDb Rating" span={2}>
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

      <PanelSection label="Rotten Tomatoes" span={2}>
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
