import { DEFAULT_FILTERS } from "@/hooks/useFilters/default-filters";
import { sortChoiceKey } from "./sort-choice-key";

export const DEFAULT_SORT_CHOICE = sortChoiceKey(DEFAULT_FILTERS.sort, DEFAULT_FILTERS.sortOrder);
