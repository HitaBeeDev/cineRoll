import type { FacetCounts } from "@cineroll/types";

import { cache, cacheKeys } from "../../../lib/cache";
import type { ListQuery } from "../../../lib/filmFilters/listQuerySchema";
import {
  countAwardBodies,
  countAwardYears,
  countCategories,
  countContentTypes,
  countCountries,
  countGenres,
  countLanguages,
  countReleaseYears,
} from "./facetCountQueries";

/** Five minutes, matching the list route's public cache on the same data. */
const FACET_COUNTS_TTL_MS = 5 * 60 * 1000;

/**
 * Every browse facet's options and counts for one filter set, in one round trip.
 *
 * The eight queries are independent — each scopes the filters differently — so
 * they run concurrently and the response costs roughly the slowest one. They are
 * all read-only aggregates over a catalogue that changes on a seed, so a short
 * TTL absorbs the repeat traffic from a user working through the panel: toggling
 * a filter off and back on is a cache hit, not eight more scans.
 */
export function getFacetCounts(query: ListQuery): Promise<FacetCounts> {
  return cache.getOrSet(cacheKeys.facetCounts(facetSignature(query)), FACET_COUNTS_TTL_MS, run);

  async function run(): Promise<FacetCounts> {
    const [
      awardBodies,
      categories,
      awardYears,
      contentTypes,
      genres,
      releaseYears,
      languages,
      countries,
    ] = await Promise.all([
      countAwardBodies(query),
      countCategories(query),
      countAwardYears(query),
      countContentTypes(query),
      countGenres(query),
      countReleaseYears(query),
      countLanguages(query),
      countCountries(query),
    ]);

    return {
      awardBodies,
      categories,
      awardYears,
      contentTypes,
      genres,
      releaseYears,
      languages,
      countries,
    };
  }
}

/**
 * Cache key for a filter set. Presentation-only params are stripped: sorting or
 * paging the results cannot change how many films match, so re-sorting a browse
 * page must not miss the cache and re-run eight aggregates.
 */
function facetSignature(query: ListQuery): string {
  const {
    sort: _sort,
    sortOrder: _sortOrder,
    page: _page,
    limit: _limit,
    sample: _sample,
    ...filters
  } = query;

  return JSON.stringify(filters, Object.keys(filters).sort());
}
