"use client";

import { useState, useCallback, useMemo } from "react";
import type { FilterState } from "@cineroll/types";

const DEFAULT_DECADE_MIN = 1900;
const DEFAULT_DECADE_MAX = 2030;

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
      filters.decadeMax !== DEFAULT_DECADE_MAX,
    [filters],
  );

  return { filters, setFilter, resetFilters, hasActiveFilters };
}
