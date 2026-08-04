import type { FilterState } from "@cineroll/types";
import { FILTER_DESCRIPTORS } from "@/lib/browse/filter-descriptors/filter-descriptors";

/** How many filters are doing something right now, primary row included. */
export function countActiveFilters(filters: FilterState): number {
  return FILTER_DESCRIPTORS.filter((d) => d.isActive(filters)).length;
}
