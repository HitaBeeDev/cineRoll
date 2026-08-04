import type { FilterState } from "@cineroll/types";
import { FILTER_DESCRIPTORS } from "@/lib/browse/filter-descriptors/filter-descriptors";
import type { FilterBand } from "./filter-band";

/**
 * Active filters per advanced band, so each band heading can show what it holds.
 * The totals add up to countAdvancedFilters by construction — one table, one
 * verdict on what "active" means, whichever badge is reading it.
 */
export function countFiltersByBand(filters: FilterState): Record<FilterBand, number> {
  const counts: Record<FilterBand, number> = { primary: 0, awards: 0, film: 0, details: 0 };
  for (const descriptor of FILTER_DESCRIPTORS) {
    if (descriptor.isActive(filters)) counts[descriptor.band] += 1;
  }

  return counts;
}
