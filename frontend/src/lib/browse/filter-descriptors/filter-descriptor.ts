import type { FilterState } from "@cineroll/types";
import type { ActiveChip } from "./active-chip";
import type { FilterBand } from "./filter-band";
import type { SetFilters } from "./set-filters";

/**
 * Sorting is deliberately absent. It reorders the result set without changing
 * which films are in it, so listing it here made every derived number wrong at
 * once: switching to "Newest" lit the Advanced badge, added a "Sort: Newest" ✕
 * chip to a row that otherwise means "constraints you can remove", enabled Clear
 * all, and reported one more active filter beside a total that had not moved.
 * The sort control in the results header is where sorting is shown and changed.
 *
 * Single source of truth for "what does a non-default filter look like." Each
 * descriptor knows whether the filter is active (vs. its default in
 * DEFAULT_FILTERS), which band its control sits in, and how to render/clear its
 * removable chip. The active-chip list, the Advanced badge count and each band's
 * own badge are all derived from this one ordered table — change a filter here
 * and they stay in agreement. (The defaults themselves stay in DEFAULT_FILTERS;
 * this table only references them.)
 */
export type FilterDescriptor = {
  band: FilterBand;
  isActive: (f: FilterState) => boolean;
  // Returns one chip per active value, so a multi-select facet shows a removable
  // chip for each selected option (each clearing only its own value).
  toChips: (f: FilterState, set: SetFilters) => ActiveChip[];
};
