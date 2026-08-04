import type { FacetCounts, FilterState } from "@cineroll/types";
import { API_URL } from "@/lib/api/constants/api-url";
import { filtersToParams } from "../filters-to-params";

/**
 * Every browse facet's reachable options and their counts under `filters`.
 *
 * Unlike the fixed lists below this is filter-dependent, so it is deliberately
 * uncached here: the response changes with every filter edit, and the server
 * already caches it per filter set.
 */
export async function fetchFacetCounts(
  filters: Partial<FilterState>,
  signal: AbortSignal,
): Promise<FacetCounts> {
  const params = filtersToParams(filters);
  const response = await fetch(`${API_URL}/api/films/facets?${params}`, {
    cache: "no-store",
    signal,
  });
  if (!response.ok) throw new Error(`facets ${response.status}`);
  return response.json() as Promise<FacetCounts>;
}
