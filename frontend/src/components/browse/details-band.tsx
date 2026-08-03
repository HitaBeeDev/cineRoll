import type { FilterState } from "@cineroll/types";
import { MultiSelect } from "@/components/ui/multi-select";
import { PanelBand } from "@/components/browse/panel-band";
import { PanelSection } from "@/components/browse/panel-section";
import { ChipGroup } from "@/components/browse/chip-group";
import { FilterChip } from "@/components/browse/filter-chip";
import { ThresholdChips } from "@/components/browse/threshold-chips";
import { countryLabel, languageLabel } from "@/lib/browse/labels";
import type { SetFilters } from "@/lib/browse/filter-descriptors";

const RT_OPTIONS = [50, 60, 70, 80, 90, 95].map((s) => ({ value: s, label: `${s}%+` }));

/** The long tail: origin, and the scores/attributes few sessions reach for. */
export function DetailsBand({
  filters,
  setFilters,
  languages,
  countries,
}: {
  filters: FilterState;
  setFilters: SetFilters;
  languages: string[];
  countries: string[];
}) {
  return (
    <PanelBand label="Details">
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
        {/* A lone toggle, not a two-chip radio: "Any director" was never a
            filter, only the absence of this one. */}
        <ChipGroup label="Director" multiple>
          <FilterChip
            multiple
            active={filters.femaleDirectorOnly}
            onClick={() => setFilters({ femaleDirectorOnly: !filters.femaleDirectorOnly, page: 1 })}
          >
            Female-directed
          </FilterChip>
        </ChipGroup>
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
