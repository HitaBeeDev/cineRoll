"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import type { FilterState } from "@cineroll/types";
import { trackEvent } from "@/lib/analytics";
import { filtersFromSearchParams } from "@/lib/browse/filter-params/filters-from-search-params";
import { serializeFilters } from "@/lib/browse/filter-params/serialize-filters";
import { DEFAULT_FILTERS } from "@/hooks/useFilters/default-filters";
import { anyFilterActive } from "@/lib/browse/filter-descriptors/any-filter-active";
import { ROLL_SEARCH_PARAM } from "@/lib/browse/filter-params/roll-search-param";
import { withSearchSort } from "@/lib/browse/sort-choices/with-search-sort";

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

  // A signed-out visitor has no watch history, so "hide what I've watched" can
  // only be a filter that promises something and does nothing — a link carrying
  // it (shared by someone signed in) is neutralised here, once, rather than in
  // each of the request, the chip bar and the control that would read it.
  const signedOut = useSession().status === "unauthenticated";
  const filters = useMemo(() => {
    const parsed = filtersFromSearchParams(searchParams);

    return signedOut && parsed.excludeWatched ? { ...parsed, excludeWatched: false } : parsed;
  }, [searchParams, signedOut]);
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

  // Every edit funnels through here — the search box, the autocomplete, the
  // chips, the panel — which is why the search/sort coupling lives at this
  // level rather than on the input: picking a suggestion has to move the order
  // the same way typing does.
  // Serializing rebuilds the query from the filter state alone, which is exactly
  // how a cleared filter disappears — and also how the rolled film would, on the
  // next keystroke, if it were not carried across by name.
  const withRolledFilm = useCallback(
    (query: string) => {
      const rolled = searchParams.get(ROLL_SEARCH_PARAM);
      if (!rolled) return query;

      const params = new URLSearchParams(query);
      params.set(ROLL_SEARCH_PARAM, rolled);
      return params.toString();
    },
    [searchParams],
  );

  const commitFilters = useCallback(
    (updates: Partial<FilterState>) => {
      const next = { ...filters, ...withSearchSort(filters, updates) };
      const query = withRolledFilm(serializeFilters(next));
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [filters, pathname, router, withRolledFilm],
  );

  // Clearing filters must not silently reorder the results: sorting is not one of
  // the things "Clear all filters" is offering to clear, so a chosen order
  // survives the reset. At the default order there is nothing to carry, and the
  // URL goes back to bare.
  const resetFilters = useCallback(() => {
    // …with one exception: a reset clears the search, and Relevance without a
    // query is an ordering relative to nothing. It goes back with the search.
    const sort = filters.sort === "relevance" ? DEFAULT_FILTERS.sort : filters.sort;
    const sortOrder = filters.sort === "relevance" ? DEFAULT_FILTERS.sortOrder : filters.sortOrder;
    const keepsSort = sort !== DEFAULT_FILTERS.sort || sortOrder !== DEFAULT_FILTERS.sortOrder;
    const query = withRolledFilm(
      keepsSort ? serializeFilters({ ...DEFAULT_FILTERS, sort, sortOrder }) : "",
    );

    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [filters.sort, filters.sortOrder, pathname, router, withRolledFilm]);

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
