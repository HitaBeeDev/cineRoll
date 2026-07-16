"use client";

import { useEffect, useState } from "react";
import type { FilterState } from "@cineroll/types";
import { fetchRandomCount } from "@/lib/api";
import { FILTER_COUNT_DEBOUNCE_MS } from "./constants";

export function useFilteredFilmCount(filters: FilterState, hasActiveFilters: boolean) {
  const [filteredCount, setFilteredCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!hasActiveFilters) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setIsLoading(true);
      void fetchRandomCount(filters)
        .then((count) => { if (!cancelled) setFilteredCount(count); })
        .catch(() => { if (!cancelled) setFilteredCount(null); })
        .finally(() => { if (!cancelled) setIsLoading(false); });
    }, FILTER_COUNT_DEBOUNCE_MS);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [filters, hasActiveFilters]);

  return { filteredCount, setFilteredCount, isFilteredCountLoading: isLoading };
}
