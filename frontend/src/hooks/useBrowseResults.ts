"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FilterState, PaginatedFilms } from "@cineroll/types";
import { fetchFilms } from "@/lib/api";
import { PAGE_SIZE, type LoadStatus } from "@/lib/browse/options";

export type BrowseResults = {
  result: PaginatedFilms | null;
  status: LoadStatus;
  /** A slow (>150ms) load — drives grid-vs-skeleton and stale-grid handling. */
  slowLoad: boolean;
  /** True only for the very first non-empty grid, so the staggered entrance
   *  animation runs once and later result sets get a quick uniform fade. */
  firstGridPaint: boolean;
  retry: () => void;
};

/**
 * Fetches the paginated film results for the current filters. Only the free-text
 * search is debounced (300ms); discrete controls fire immediately. A load is
 * promoted to "slow" after 150ms so quick cache-served refetches can hold the
 * previous grid instead of flashing skeletons.
 */
export function useBrowseResults(filters: FilterState): BrowseResults {
  const [result, setResult] = useState<PaginatedFilms | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [reloadNonce, setReloadNonce] = useState(0);

  const [slowLoad, setSlowLoad] = useState(false);
  // Reset the flag at the start of each load by adjusting state during render
  // so a fresh refetch starts optimistic and the 150ms timer re-raises it.
  const [slowLoadStatus, setSlowLoadStatus] = useState(status);
  if (status !== slowLoadStatus) {
    setSlowLoadStatus(status);
    if (status === "loading") setSlowLoad(false);
  }

  const showGrid = status === "success" && !!result && result.films.length > 0;
  const [hasAnimatedGrid, setHasAnimatedGrid] = useState(false);
  if (showGrid && !hasAnimatedGrid) setHasAnimatedGrid(true);
  const firstGridPaint = showGrid && !hasAnimatedGrid;

  // 300ms delay only when `search` changed; 0 otherwise (discrete controls and
  // the first load should be immediate). Seeded from the initial search.
  const prevFetchedSearch = useRef(filters.search);
  useEffect(() => {
    const delay = filters.search !== prevFetchedSearch.current ? 300 : 0;
    prevFetchedSearch.current = filters.search;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setStatus("loading");
      void fetchFilms(filters, PAGE_SIZE)
        .then((data) => { if (!cancelled) { setResult(data); setStatus("success"); } })
        .catch((err) => {
          if (cancelled) return;
          // Surface the real failure for debugging; the UI still shows the
          // generic "Something went wrong" retry state.
          console.error("[browse] fetchFilms failed", err);
          setResult(null);
          setStatus("error");
        });
    }, delay);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [filters, reloadNonce]);

  useEffect(() => {
    if (status !== "loading") return;
    const timer = window.setTimeout(() => setSlowLoad(true), 150);
    return () => window.clearTimeout(timer);
  }, [status, filters, reloadNonce]);

  const retry = useCallback(() => setReloadNonce((n) => n + 1), []);

  return { result, status, slowLoad, firstGridPaint, retry };
}
