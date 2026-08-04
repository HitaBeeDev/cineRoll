import { SORT_CHOICES } from "@/lib/browse/sort-choices/sort-choices";

/** The orderings that exist for the current query state. */
export function sortOptionsFor(hasSearch: boolean): { value: string; label: string }[] {
  return SORT_CHOICES
    .filter((c) => !c.searchOnly || hasSearch)
    .map(({ value, label }) => ({ value, label }));
}
