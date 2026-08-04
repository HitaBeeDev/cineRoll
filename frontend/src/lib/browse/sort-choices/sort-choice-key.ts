import type { FilterState } from "@cineroll/types";

export function sortChoiceKey(
  sort: FilterState["sort"],
  sortOrder: FilterState["sortOrder"],
): string {
  return `${sort}:${sortOrder}`;
}
