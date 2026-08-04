import type { FilterState } from "@cineroll/types";
import { DEFAULT_FILTERS } from "@/hooks/useFilters/default-filters";
import { SORT_CHOICES } from "@/lib/browse/sort-choices/sort-choices";

/**
 * A key back into the pair the rest of the app stores. Unknown keys resolve to
 * the default rather than throwing: the value reaches here from a URL.
 */
export function sortChoiceFromKey(
  key: string,
): Pick<FilterState, "sort" | "sortOrder"> {
  const found = SORT_CHOICES.find((c) => c.value === key);

  return found
    ? { sort: found.sort, sortOrder: found.sortOrder }
    : { sort: DEFAULT_FILTERS.sort, sortOrder: DEFAULT_FILTERS.sortOrder };
}
