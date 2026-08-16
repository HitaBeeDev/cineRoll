import type { FilterState } from "@cineroll/types";
import { filtersToParams } from "@/lib/api";
import { DEFAULT_FILTERS } from "@/hooks/useFilters/default-filters";

/**
 * Browse state → query string. The URL is the single source of truth here, so
 * this has to be lossless in a way the API params do not: whatever comes out
 * must parse back to the same filters through `filtersFromSearchParams`.
 *
 * That is why `sort` is re-applied below. `filtersToParams` omits it when it is
 * `newest`, which is correct for a request — the API's own default is `newest`,
 * so the shorter URL means the same thing. Browse defaults to `wins` instead,
 * so an omitted `sort` reads back as `wins` and the two orderings that sit on
 * `newest` — "Newest first" and "Oldest first" — could never survive the round
 * trip: picking either wrote nothing (or a bare `sortOrder=asc`), and the
 * control snapped back to "Most wins". Written against browse's own default,
 * every listed choice round-trips. In practice this only ever adds `newest`,
 * since `filtersToParams` already emits every other value.
 */
export function serializeFilters(filters: FilterState): string {
  const params = filtersToParams(filters);
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set("sort", filters.sort);
  if (filters.page > 1) params.set("page", String(filters.page));
  return params.toString();
}
