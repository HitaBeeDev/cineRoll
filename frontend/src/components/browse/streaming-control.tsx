"use client";

import type { FacetCounts, FilterState } from "@cineroll/types";
import { FilterSelect } from "@/components/browse/filter-select";
import { CONTROL_WIDTH } from "@/components/browse/panel-section/control-width";
import type { SetFilters } from "@/lib/browse/filter-descriptors/set-filters";
import { regionName } from "@/lib/streaming/region-name";
import { STREAMING_REGIONS } from "@/lib/streaming/streaming-regions";
import { useStreamingRegion } from "@/lib/streaming/use-streaming-region";

// Radix Select can't hold "" as an item value, so "no service" needs a token.
const ANY = "any";

/**
 * "Streaming on [service] in [country]". The service list is the providers
 * facet for that country under the other filters, so every option leads
 * somewhere. Changing country clears the service: it may not exist there.
 */
export function StreamingControl({
  filters,
  setFilters,
  counts,
}: {
  filters: FilterState;
  setFilters: SetFilters;
  counts: FacetCounts;
}) {
  const region = useStreamingRegion(filters.streamingRegion);

  const regionOptions = [...new Set<string>([...STREAMING_REGIONS, region])]
    .map((code) => ({ value: code, label: regionName(code) }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const providerOptions = [
    { value: ANY, label: "Any service" },
    ...counts.providers.map((provider) => ({ value: provider.value, label: provider.name })),
  ];
  // A shared link can name a service the current list doesn't (still loading,
  // or nothing left under the other filters) — keep it selectable, not blank.
  const selected = filters.provider != null ? String(filters.provider) : ANY;
  if (selected !== ANY && !providerOptions.some((option) => option.value === selected)) {
    providerOptions.push({ value: selected, label: "Selected service" });
  }

  return (
    <div className="flex flex-col gap-2">
      <FilterSelect
        value={selected}
        ariaLabel="Streaming service"
        options={providerOptions}
        className={`${CONTROL_WIDTH} text-fg-hi`}
        onValueChange={(value) =>
          setFilters({
            provider: value === ANY ? null : Number(value),
            // Pin the country the service was picked in, so the link means the same thing to whoever opens it.
            streamingRegion: value === ANY ? "" : region,
            page: 1,
          })
        }
      />
      <FilterSelect
        value={region}
        ariaLabel="Streaming country"
        options={regionOptions}
        className={`${CONTROL_WIDTH} text-fg-muted`}
        onValueChange={(value) =>
          setFilters({
            streamingRegion: value,
            // The same service may not exist in the new country; drop it rather than show an empty grid.
            provider: null,
            page: 1,
          })
        }
      />
    </div>
  );
}
