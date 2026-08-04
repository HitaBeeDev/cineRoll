import type { FilterState } from "@cineroll/types";
import { DEFAULT_FILTERS } from "@/hooks/useFilters/default-filters";
import { SORT_CHOICES } from "@/lib/browse/sort-choices/sort-choices";

/**
 * Snap an arbitrary sort/order pair onto a listed choice, so the state behind
 * the control can only ever be something the control can say out loud.
 *
 * This is what keeps the old links honest. `?sort=wins&sortOrder=asc` was
 * reachable before, and rendering it would put "Most wins" over a grid of films
 * that won nothing; it now lands on the ordering with that name. A pair with no
 * listed reversal keeps its `sort` and takes the direction that sort ships with.
 */
export function resolveSortChoice(
  sort: FilterState["sort"],
  sortOrder: FilterState["sortOrder"],
): Pick<FilterState, "sort" | "sortOrder"> {
  const exact = SORT_CHOICES.find((c) => c.sort === sort && c.sortOrder === sortOrder);
  const listed = exact ?? SORT_CHOICES.find((c) => c.sort === sort);

  return listed
    ? { sort: listed.sort, sortOrder: listed.sortOrder }
    : { sort: DEFAULT_FILTERS.sort, sortOrder: DEFAULT_FILTERS.sortOrder };
}
