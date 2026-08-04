import type { FilterState } from "@cineroll/types";
import { filtersToParams } from "@/lib/api";

export function serializeFilters(filters: FilterState): string {
  const params = filtersToParams(filters);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.toString();
}
