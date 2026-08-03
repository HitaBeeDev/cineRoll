import type { FacetCounts, FilterState } from "@cineroll/types";
import { MultiSelect } from "@/components/ui/multi-select";
import { PanelBand } from "@/components/browse/panel-band";
import { CONTROL_WIDTH, PanelSection } from "@/components/browse/panel-section";
import { ChipGroup } from "@/components/browse/chip-group";
import { FilterChip } from "@/components/browse/filter-chip";
import { countryLabel, languageLabel } from "@/lib/browse/labels";
import { reachableOptions } from "@/lib/browse/facet-options";
import type { SetFilters } from "@/lib/browse/filter-descriptors";

/** The long tail: where a film comes from, and who made it. */
export function DetailsBand({
  filters,
  setFilters,
  activeCount,
  counts,
}: {
  filters: FilterState;
  setFilters: SetFilters;
  activeCount: number;
  counts: FacetCounts;
}) {
  // Languages arrive as ISO codes in code order, which is not the order their
  // names read in; countries already arrive alphabetical by the value shown.
  const languageOptions = reachableOptions(
    counts.languages,
    filters.languages,
    languageLabel,
  ).sort((a, b) => a.label.localeCompare(b.label));
  const countryOptions = reachableOptions(counts.countries, filters.countries, countryLabel);

  return (
    <PanelBand label="Details" activeCount={activeCount}>
      <PanelSection label="Language">
        <MultiSelect
          selected={filters.languages}
          onChange={(vals) => setFilters({ languages: vals, page: 1 })}
          placeholder="Any language"
          searchable
          triggerClassName={CONTROL_WIDTH}
          options={languageOptions}
        />
      </PanelSection>

      <PanelSection label="Country">
        <MultiSelect
          selected={filters.countries}
          onChange={(vals) => setFilters({ countries: vals, page: 1 })}
          placeholder="Any country"
          searchable
          triggerClassName={CONTROL_WIDTH}
          options={countryOptions}
        />
      </PanelSection>

      {/* "Directed by", not "Director": the heading has to describe the one
          toggle underneath it, and a heading reading "Director" promises a name
          to search for. A lone toggle, not a two-chip radio — "any director" was
          never a filter, only the absence of this one. */}
      <PanelSection label="Directed by">
        <ChipGroup>
          <FilterChip
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
