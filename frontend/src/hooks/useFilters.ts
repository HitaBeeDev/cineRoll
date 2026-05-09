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
  awardBody: "all",
  winnerOnly: false,
  nominatedOnly: false,
  category: "",
  awardYear: null,
  genre: "",
  contentType: "",
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
  tvType: "",
  page: 1,
};

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

  const hasActiveFilters = useMemo(
    () =>
      !!filters.search ||
      !!filters.person ||
      !!filters.director ||
      filters.femaleDirectorOnly ||
      filters.awardBody !== "all" ||
      filters.winnerOnly ||
      filters.nominatedOnly ||
      !!filters.category ||
      filters.awardYear != null ||
      !!filters.genre ||
      !!filters.contentType ||
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
      filters.rtScoreMin > 0,
    [filters],
  );

  return { filters, setFilter, resetFilters, hasActiveFilters };
}
