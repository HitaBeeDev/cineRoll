import type { FacetCounts, FilterState } from "@cineroll/types";
import { MultiSelect } from "@/components/ui/multi-select";
import { PanelBand } from "@/components/browse/panel-band";
import { CONTROL_WIDTH, PanelSection } from "@/components/browse/panel-section";
import { FilterCheckbox } from "@/components/browse/filter-checkbox";
import { countryLabel, languageLabel } from "@/lib/browse/labels";
import { reachableOptions } from "@/lib/browse/facet-options";
import type { SetFilters } from "@/lib/browse/filter-descriptors";

/** The long tail: where a film comes from, and who made it. */
export function DetailsBand({
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
  // Languages arrive as ISO codes in code order, which is not the order their
  // names read in; countries already arrive alphabetical by the value shown.
  const languageOptions = reachableOptions(
    counts.languages,
    filters.languages,
    languageLabel,
  ).sort((a, b) => a.label.localeCompare(b.label));
  const countryOptions = reachableOptions(counts.countries, filters.countries, countryLabel);

  return (
    <PanelBand label="Details" activeCount={activeCount} collapsible={collapsible}>
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

      {/* One boolean, stated in full by its own label — so no caption above it,
          and half the height the captioned chip row took. */}
      <PanelSection label="Filmmaker">
        <FilterCheckbox
          label="Directed by a woman"
          checked={filters.femaleDirectorOnly}
          onChange={(checked) => setFilters({ femaleDirectorOnly: checked, page: 1 })}
        />
      </PanelSection>
    </PanelBand>
  );
}
