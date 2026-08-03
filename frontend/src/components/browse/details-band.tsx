import type { FilterState } from "@cineroll/types";
import { MultiSelect } from "@/components/ui/multi-select";
import { PanelBand } from "@/components/browse/panel-band";
import { CONTROL_WIDTH, PanelSection } from "@/components/browse/panel-section";
import { ChipGroup } from "@/components/browse/chip-group";
import { FilterChip } from "@/components/browse/filter-chip";
import { countryLabel, languageLabel } from "@/lib/browse/labels";
import type { SetFilters } from "@/lib/browse/filter-descriptors";

/** The long tail: where a film comes from, and who made it. */
export function DetailsBand({
  filters,
  setFilters,
  activeCount,
  languages,
  countries,
}: {
  filters: FilterState;
  setFilters: SetFilters;
  activeCount: number;
  languages: string[];
  countries: string[];
}) {
  return (
    <PanelBand label="Details" activeCount={activeCount}>
      <PanelSection label="Language">
        <MultiSelect
          ariaLabel="Language"
          selected={filters.languages}
          onChange={(vals) => setFilters({ languages: vals, page: 1 })}
          placeholder="Any language"
          searchable
          triggerClassName={CONTROL_WIDTH}
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
          triggerClassName={CONTROL_WIDTH}
          options={countries.map((c) => ({ value: c, label: countryLabel(c) }))}
        />
      </PanelSection>

      {/* "Directed by", not "Director": the heading has to describe the one
          toggle underneath it, and a heading reading "Director" promises a name
          to search for. A lone toggle, not a two-chip radio — "any director" was
          never a filter, only the absence of this one. */}
      <PanelSection label="Directed by">
        <ChipGroup label="Directed by" multiple>
          <FilterChip
            multiple
            active={filters.femaleDirectorOnly}
            onClick={() => setFilters({ femaleDirectorOnly: !filters.femaleDirectorOnly, page: 1 })}
          >
            A woman
          </FilterChip>
        </ChipGroup>
      </PanelSection>
    </PanelBand>
  );
}
