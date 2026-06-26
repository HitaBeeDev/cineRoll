"use client";

import { useState, useCallback, useMemo } from "react";
import type { FilterState } from "@cineroll/types";

const DEFAULT_DECADE_MIN = 1900;
const DEFAULT_DECADE_MAX = 2030;
export const DEFAULT_FILTERS: FilterState = {
  search: "",
  person: "",
  director: "",
  femaleDirectorOnly: false,
  awardBodies: [],
  winnerOnly: false,
  nominatedOnly: false,
  categories: [],
  awardYear: null,
  languages: [],
  genres: [],
  countries: [],
  contentTypes: [],
  runtimeMax: null,
  decadeMin: DEFAULT_DECADE_MIN,
  decadeMax: DEFAULT_DECADE_MAX,
  nominationCount: null,
  imdbRatingMin: 0,
  imdbRatingMax: null,
  rtScoreMin: 0,
  certificate: "",
  imdbTopMoviesOnly: false,
  imdbTopTvOnly: false,
  imdbTopExclude: false,
  winsMax: null,
  tvType: "",
  sort: "awards",
  sortOrder: "desc",
  page: 1,
};

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
    filters.languages.length > 0 ||
    filters.genres.length > 0 ||
    filters.countries.length > 0 ||
    filters.contentTypes.length > 0 ||
    filters.runtimeMax != null ||
    filters.decadeMin !== DEFAULT_DECADE_MIN ||
    filters.decadeMax !== DEFAULT_DECADE_MAX ||
    filters.nominationCount != null ||
    filters.imdbRatingMin > 0 ||
    filters.imdbRatingMax != null ||
    !!filters.certificate ||
    filters.imdbTopMoviesOnly ||
    filters.imdbTopTvOnly ||
    !!filters.tvType ||
    filters.sort !== "awards" ||
    filters.rtScoreMin > 0
  );
}

export function useFilters(initial?: Partial<FilterState>) {
  const [filters, setFiltersState] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    ...initial,
  });

  const setFilter = useCallback((updates: Partial<FilterState>) => {
    setFiltersState(prev => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters = useMemo(() => computeHasActiveFilters(filters), [filters]);

  return { filters, setFilter, resetFilters, hasActiveFilters };
}
