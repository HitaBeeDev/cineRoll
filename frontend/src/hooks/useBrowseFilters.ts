"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { FilterState } from "@cineroll/types";
import { trackEvent } from "@/lib/analytics";
import { filtersFromSearchParams, serializeFilters } from "@/lib/browse/filter-params";
import { anyFilterActive } from "@/lib/browse/filter-descriptors";

/**
 * The URL query string is the single source of truth for browse filters:
 * `filters` is derived from it, edits write back to it, and the change flows in
 * through `searchParams` — so back/forward navigation just works with no
 * bidirectional state sync. `searchDraft` is the one local buffer, echoing
 * keystrokes instantly while the URL updates underneath it.
 */
export function useBrowseFilters() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams]);
  // "Active" is derived from the same descriptor table that renders the chips,
  // so the Roll button / Clear-all only appear when there is a chip to clear.
  const hasActiveFilters = useMemo(() => anyFilterActive(filters), [filters]);

  // Adjust the draft during render when the URL search changes from outside the
  // input (back/forward, chip removal, reset) — the documented pattern, no effect.
  const [searchDraft, setSearchDraft] = useState(filters.search);
  const [lastUrlSearch, setLastUrlSearch] = useState(filters.search);
  if (filters.search !== lastUrlSearch) {
    setLastUrlSearch(filters.search);
    setSearchDraft(filters.search);
  }

  const commitFilters = useCallback(
    (updates: Partial<FilterState>) => {
      const next = { ...filters, ...updates };
      const query = serializeFilters(next);
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [filters, pathname, router],
  );

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  // Search is tracked separately by the autocomplete hook (one event per settled
  // query, not one per keystroke), so it is excluded from filter_apply here.
  const setFilters = useCallback(
    (updates: Partial<FilterState>) => {
      commitFilters(updates);

      const trackedKeys = Object.keys(updates).filter(
        (key) => key !== "page" && key !== "search",
      );
      if (trackedKeys.length === 0) return;

      trackEvent({ type: "filter_apply", context: { source: "browse", updates } });
    },
    [commitFilters],
  );

  return { filters, hasActiveFilters, searchDraft, setSearchDraft, setFilters, resetFilters };
}
