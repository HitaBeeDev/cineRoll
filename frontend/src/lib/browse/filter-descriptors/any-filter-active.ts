import type { FilterState } from "@cineroll/types";
import { FILTER_DESCRIPTORS } from "@/lib/browse/filter-descriptors/filter-descriptors";

/** Does any browse filter differ from its default? Derived from the same table
 *  that builds the chips, so "is active" and "has a removable chip" stay in lockstep. */
export function anyFilterActive(filters: FilterState): boolean {
  return FILTER_DESCRIPTORS.some((d) => d.isActive(filters));
}
