"use client";

import { useSession } from "next-auth/react";
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
  const signedIn = useSession().status === "authenticated";

  return (
    /* Three cells, one row. The two checkboxes used to be a section each —
       "Filmmaker" over one line, "Your History" over another — which put a
       caption above a control that already said the whole thing in its own
       label, and left the band running onto a second row that was two thirds
       empty. Gathered under one heading they read as what they are: a pair of
       narrowings on the same set, phrased the same way. */
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

      {/* Both booleans state themselves in full, so the caption over them only
          has to say what they have in common — and phrasing the second as what
          to keep rather than what to hide is what lets one heading cover both. */}
      <PanelSection label="Only Show">
        <div className="flex flex-col gap-2.5">
          <FilterCheckbox
            label="Films directed by a woman"
            checked={filters.femaleDirectorOnly}
            onChange={(checked) => setFilters({ femaleDirectorOnly: checked, page: 1 })}
          />

          {/* Signed in only, because it filters against the viewer's own history:
              shown to a signed-out visitor it could only ever be a checkbox that
              changes nothing. */}
          {signedIn && (
            <FilterCheckbox
              label="Films I haven't watched"
              checked={filters.excludeWatched}
              onChange={(checked) => setFilters({ excludeWatched: checked, page: 1 })}
            />
          )}
        </div>
      </PanelSection>
    </PanelBand>
  );
}
