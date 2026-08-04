"use client";

import { useState, useCallback, useMemo } from "react";
import type { FilterState } from "@cineroll/types";
import { DEFAULT_FILTERS } from "./default-filters";
import { computeHasActiveFilters } from "./compute-has-active-filters";

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
