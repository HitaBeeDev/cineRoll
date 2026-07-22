import type { FilterState } from "@cineroll/types";
import { MultiSelect } from "@/components/ui/multi-select";
import { PanelSection } from "@/components/browse/panel-section";
import { ChipGroup } from "@/components/browse/chip-group";
import { FilterChip } from "@/components/browse/filter-chip";
import { FilterSelect } from "@/components/browse/filter-select";
import {
  BROWSE_DECADE_OPTIONS,
  CONTENT_TYPE_OPTIONS,
  DECADE_MAX,
  DECADE_MIN,
} from "@/lib/browse/options";
import { countryLabel, languageLabel } from "@/lib/browse/labels";
import { toggleValue } from "@/lib/browse/filter-updates";
import type { BrowseFacetOptions } from "@/hooks/useBrowseFacetOptions";
import type { SetFilters } from "@/lib/browse/filter-descriptors";

/**
 * The expanded "Advanced" filter panel: one dense grid ordered so related
 * filters sit together — ratings → format/origin → people → awards/time.
 */
export function BrowseAdvancedPanel({
  filters,
  setFilters,
  facets,
}: {
  filters: FilterState;
  setFilters: SetFilters;
  facets: BrowseFacetOptions;
}) {
  const { genres, countries, languages, categories, awardYears } = facets;

  return (
    <div className="border-t border-white/10 bg-[#090910]/98">
      <div className="mx-auto w-full max-w-[100vw] px-4 py-6 sm:max-w-screen-2xl sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          <PanelSection label="IMDb Rating">
            <ChipGroup label="Minimum IMDb rating">
              {[0, 6, 6.5, 7, 7.5, 8, 8.5, 9].map((r) => (
                <FilterChip
                  key={r}
                  active={filters.imdbRatingMin === r}
                  onClick={() => setFilters({ imdbRatingMin: r, page: 1 })}
                >
                  {r === 0 ? "Any" : `${r}+`}
                </FilterChip>
              ))}
            </ChipGroup>
          </PanelSection>

          <PanelSection label="Rotten Tomatoes">
            <ChipGroup label="Minimum Rotten Tomatoes score">
              {[0, 50, 60, 70, 80, 90, 95].map((s) => (
                <FilterChip
                  key={s}
                  active={filters.rtScoreMin === s}
                  onClick={() => setFilters({ rtScoreMin: s, page: 1 })}
                >
                  {s === 0 ? "Any" : `${s}%+`}
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
              options={genres.map((g) => ({ value: g, label: g }))}
            />
          </PanelSection>

          <PanelSection label="Content Type">
            <ChipGroup label="Content type" multiple>
              <FilterChip
                multiple
                active={filters.contentTypes.length === 0}
                onClick={() => setFilters({ contentTypes: [], page: 1 })}
              >
                All
              </FilterChip>
              {CONTENT_TYPE_OPTIONS.map(({ value, label }) => (
                <FilterChip
                  key={value}
                  multiple
                  active={filters.contentTypes.includes(value)}
                  onClick={() => setFilters({ contentTypes: toggleValue(filters.contentTypes, value), page: 1 })}
                >
                  {label}
                </FilterChip>
              ))}
            </ChipGroup>
          </PanelSection>

          <PanelSection label="Max Runtime">
            <ChipGroup label="Maximum runtime">
              {([
                { value: null, label: "Any"   },
                { value: 90,   label: "≤ 90m" },
                { value: 120,  label: "≤ 2h"  },
                { value: 150,  label: "≤ 2h30" },
                { value: 180,  label: "≤ 3h"  },
              ] as { value: number | null; label: string }[]).map(({ value, label }) => (
                <FilterChip
                  key={label}
                  active={filters.runtimeMax === value}
                  onClick={() => setFilters({ runtimeMax: value, page: 1 })}
                >
                  {label}
                </FilterChip>
              ))}
            </ChipGroup>
          </PanelSection>

          <PanelSection label="Language">
            <MultiSelect
              ariaLabel="Language"
              selected={filters.languages}
              onChange={(vals) => setFilters({ languages: vals, page: 1 })}
              placeholder="Any language"
              searchable
              triggerClassName="w-full"
              options={languages
                .map((c) => ({ value: c, label: languageLabel(c) }))
                .sort((a, b) => a.label.localeCompare(b.label))}
            />
          </PanelSection>

          <PanelSection label="Country">
            <MultiSelect
              ariaLabel="Country"
              selected={filters.countries}
              onChange={(vals) => setFilters({ countries: vals, page: 1 })}
              placeholder="Any country"
              searchable
              triggerClassName="w-full"
              options={countries.map((c) => ({ value: c, label: countryLabel(c) }))}
            />
          </PanelSection>

          <PanelSection label="Director">
            <ChipGroup label="Director">
              <FilterChip active={!filters.femaleDirectorOnly} onClick={() => setFilters({ femaleDirectorOnly: false, page: 1 })}>
                Any
              </FilterChip>
              <FilterChip active={filters.femaleDirectorOnly} onClick={() => setFilters({ femaleDirectorOnly: true, page: 1 })}>
                Female-directed
              </FilterChip>
            </ChipGroup>
          </PanelSection>

          <PanelSection label="Award Nominations">
            <ChipGroup label="Minimum total award nominations">
              {([
                { value: null, label: "Any" },
                { value: 1,    label: "1+"  },
                { value: 3,    label: "3+"  },
                { value: 5,    label: "5+"  },
                { value: 10,   label: "10+" },
                { value: 20,   label: "20+" },
              ] as { value: number | null; label: string }[]).map(({ value, label }) => (
                <FilterChip
                  key={label}
                  active={(filters.nominationCount ?? null) === value}
                  onClick={() => setFilters({ nominationCount: value, page: 1 })}
                >
                  {label}
                </FilterChip>
              ))}
            </ChipGroup>
          </PanelSection>

          <PanelSection label="Award Category">
            <MultiSelect
              ariaLabel="Award category"
              selected={filters.categories}
              onChange={(vals) => setFilters({ categories: vals, page: 1 })}
              placeholder="Any category"
              searchable
              triggerClassName="w-full"
              options={categories.map((c) => ({ value: c, label: c }))}
            />
          </PanelSection>

          <PanelSection label="Ceremony Year">
            <FilterSelect
              value={filters.awardYear != null ? String(filters.awardYear) : "_any"}
              onValueChange={(val) => setFilters({ awardYear: val === "_any" ? null : Number(val), page: 1 })}
              placeholder="Any year"
              ariaLabel="Ceremony year"
              className="w-full text-[#b8b5c8]"
              options={[{ value: "_any", label: "Any year" }, ...awardYears.map((y) => ({ value: String(y), label: String(y) }))]}
            />
          </PanelSection>

          {/* Decade — heading and the dash convey the range, so the two selects
              need no From/To captions (kept as aria-labels). */}
          <PanelSection label="Decade range">
            <div className="flex items-center gap-2">
              <FilterSelect
                value={String(filters.decadeMin)}
                onValueChange={(val) => setFilters({ decadeMin: Number(val), page: 1 })}
                ariaLabel="Decade from"
                className="w-full flex-1 text-[#b8b5c8]"
                options={BROWSE_DECADE_OPTIONS.map((d) => ({ value: String(d), label: d === DECADE_MIN ? "Earliest" : `${d}s` }))}
              />
              <span className="font-[family-name:var(--font-geist-mono)] text-[12px] text-[#56515f]" aria-hidden>–</span>
              <FilterSelect
                value={String(filters.decadeMax)}
                onValueChange={(val) => setFilters({ decadeMax: Number(val), page: 1 })}
                ariaLabel="Decade to"
                className="w-full flex-1 text-[#b8b5c8]"
                options={BROWSE_DECADE_OPTIONS.map((d) => ({ value: String(d), label: d === DECADE_MAX ? "Latest" : `${d}s` }))}
              />
            </div>
          </PanelSection>
        </div>
      </div>
    </div>
  );
}
