"use client";

import { useState, useCallback, useMemo } from "react";
import type { FilterState } from "@cineroll/types";

const DEFAULT_DECADE_MIN = 1900;
const DEFAULT_DECADE_MAX = 2030;
export const DEFAULT_IMDB_MIN = 0;
export const DEFAULT_IMDB_MAX = 10;
export const DEFAULT_RT_MIN = 0;
export const DEFAULT_RT_MAX = 100;

export const DEFAULT_FILTERS: FilterState = {
  search: "",
  person: "",
  director: "",
  awardBody: "both",
  winnerOnly: false,
  nominatedOnly: false,
  category: "",
  awardYear: null,
  genre: "",
  decadeMin: DEFAULT_DECADE_MIN,
  decadeMax: DEFAULT_DECADE_MAX,
  imdbRatingMin: DEFAULT_IMDB_MIN,
  imdbRatingMax: DEFAULT_IMDB_MAX,
  rtScoreMin: DEFAULT_RT_MIN,
  rtScoreMax: DEFAULT_RT_MAX,
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
      filters.awardBody !== "both" ||
      filters.winnerOnly ||
      filters.nominatedOnly ||
      !!filters.category ||
      filters.awardYear != null ||
      !!filters.genre ||
      filters.decadeMin !== DEFAULT_DECADE_MIN ||
      filters.decadeMax !== DEFAULT_DECADE_MAX ||
      filters.imdbRatingMin !== DEFAULT_IMDB_MIN ||
      filters.imdbRatingMax !== DEFAULT_IMDB_MAX ||
      filters.rtScoreMin !== DEFAULT_RT_MIN ||
      filters.rtScoreMax !== DEFAULT_RT_MAX,
    [filters],
  );

  return { filters, setFilter, resetFilters, hasActiveFilters };
}
