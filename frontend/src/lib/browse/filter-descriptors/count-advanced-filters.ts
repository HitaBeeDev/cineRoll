import type { FilterState } from "@cineroll/types";
import { FILTER_DESCRIPTORS } from "@/lib/browse/filter-descriptors/filter-descriptors";

/** Count of active filters that live behind the Advanced disclosure (not the always-visible primary bar). */
export function countAdvancedFilters(filters: FilterState): number {
  return FILTER_DESCRIPTORS.filter((d) => d.band !== "primary" && d.isActive(filters)).length;
}
