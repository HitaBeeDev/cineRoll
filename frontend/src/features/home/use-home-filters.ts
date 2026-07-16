"use client";

import { useCallback } from "react";
import type { FilterState } from "@cineroll/types";
import { useFilters } from "@/hooks/useFilters";
import { trackEvent } from "@/lib/analytics";

export function useHomeFilters() {
  const { filters, setFilter, resetFilters, hasActiveFilters } = useFilters();

  const applyFilters = useCallback((updates: Partial<FilterState>) => {
    setFilter(updates);
    void trackEvent({ type: "filter_apply", context: { source: "home", updates } });
  }, [setFilter]);

  const clearTrackedFilters = useCallback(() => {
    resetFilters();
    void trackEvent({ type: "filter_apply", context: { source: "home", action: "clear" } });
  }, [resetFilters]);

  return { filters, setFilter, resetFilters, hasActiveFilters, applyFilters, clearTrackedFilters };
}
