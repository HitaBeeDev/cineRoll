"use client";

import type { FilterState } from "@cineroll/types";

/** Pure predicate: does this filter set differ from the defaults in any user-meaningful way? */
export function computeHasActiveFilters(filters: FilterState): boolean {
  return (
    !!filters.search ||
    !!filters.person ||
    !!filters.director ||
    filters.femaleDirectorOnly ||
    filters.awardBodies.length > 0 ||
    filters.winnerOnly ||
    filters.nominatedOnly ||
    filters.categories.length > 0 ||
    filters.awardYear != null ||
    filters.awardYearMin != null ||
    filters.awardYearMax != null ||
    filters.languages.length > 0 ||
    filters.genres.length > 0 ||
    filters.countries.length > 0 ||
    filters.contentTypes.length > 0 ||
    filters.runtimeMin != null ||
    filters.runtimeMax != null ||
    filters.yearMin != null ||
    filters.yearMax != null ||
    filters.nominationCount != null ||
    filters.ceremonyCount != null ||
    filters.imdbRatingMin > 0 ||
    filters.imdbRatingMax != null ||
    !!filters.certificate ||
    filters.winsMin != null ||
    filters.winsMax != null ||
    filters.imdbTopMoviesOnly ||
    filters.imdbTopTvOnly ||
    !!filters.tvType ||
    filters.excludeWatched ||
    filters.sort !== "wins" ||
    filters.rtScoreMin > 0
  );
}
