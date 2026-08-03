"use client";

import { useEffect, useMemo, useState } from "react";
import type { FacetCounts, FilterState } from "@cineroll/types";
import { EMPTY_FACET_COUNTS, fetchFacetCounts } from "@/lib/api";

export type BrowseFacets = {
  counts: FacetCounts;
  /** A refetch is in flight — the numbers on screen belong to the previous filter set. */
  stale: boolean;
};

/** Filters that change how results are presented, not which ones match. */
const PRESENTATION_KEYS = new Set(["sort", "sortOrder", "page"]);

/**
 * The browse panel's option lists, counted against the filters currently
 * applied. Replaces the six fixed catalogue-wide lists this page used to load
 * once on mount: those could offer a category the selected ceremony never
 * awards, so every such pick was a guaranteed empty grid.
 *
 * Counts stay on screen while the next set loads rather than being cleared, for
 * the same reason the result count does — a number that blanks on every click is
 * worse than one that is briefly a moment behind, and clearing them would empty
 * the dropdown the user is halfway through reading.
 */
export function useBrowseFacetCounts(filters: FilterState): BrowseFacets {
  const [counts, setCounts] = useState<FacetCounts>(EMPTY_FACET_COUNTS);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const requestKey = facetRequestKey(filters);
  // The key is the request: parsing it back means the payload sent can never
  // disagree with the dependency that triggered the send, and sorting or paging
  // the results — which cannot change what matches — never refetches.
  const request = useMemo(() => JSON.parse(requestKey) as Partial<FilterState>, [requestKey]);

  useEffect(() => {
    const controller = new AbortController();
    const key = JSON.stringify(request);

    // The same 300ms debounce the results use, so typing a title does not fire a
    // recount per keystroke. Discrete controls settle inside it either way.
    const timer = window.setTimeout(() => {
      void fetchFacetCounts(request, controller.signal)
        .then((next) => {
          setCounts(next);
          setLoadedKey(key);
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          // A failed recount must not empty the panel: the previous counts stay
          // and every option stays selectable, rather than the whole panel
          // reading as unavailable because one request failed.
          console.error("[browse] fetchFacetCounts failed", error);
          setLoadedKey(key);
        });
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [request]);

  return { counts, stale: loadedKey !== requestKey };
}

/** The filters that can change what matches, in a stable key order. */
function facetRequestKey(filters: FilterState): string {
  const entries = Object.entries(filters)
    .filter(([key]) => !PRESENTATION_KEYS.has(key))
    .sort(([a], [b]) => a.localeCompare(b));

  return JSON.stringify(Object.fromEntries(entries));
}
