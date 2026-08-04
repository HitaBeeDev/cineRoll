import type { FilterState } from "@cineroll/types";
import type { SortChoice } from "./sort-choice";
import { sortChoiceKey } from "./sort-choice-key";

export function choice(
  sort: FilterState["sort"],
  sortOrder: FilterState["sortOrder"],
  label: string,
  searchOnly = false,
): SortChoice {
  return { value: sortChoiceKey(sort, sortOrder), label, sort, sortOrder, searchOnly };
}
