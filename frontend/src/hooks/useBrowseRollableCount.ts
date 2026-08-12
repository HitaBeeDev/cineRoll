"use client";

import { useEffect, useState } from "react";
import type { FilterState } from "@cineroll/types";
import { fetchRandomCount } from "@/lib/api";
import { filtersToParams } from "@/lib/api/filters-to-params";
import { FILTER_COUNT_DEBOUNCE_MS } from "@/features/home/constants/filter-count-debounce-ms";

/**
 * How many films the browse Roll button can actually draw from.
 *
 * NOT the same number as the results heading, and deliberately so. Browse lists
 * the whole catalogue — that is its job — but the roll draws from the eligible
 * set only (see the backend's `eligibilityConditions`). The button used to
 * borrow the list total, which made it claim "Roll from 1,956 films" over a
 * reel holding 1,623, and "Roll from 1,197 films" for the Berlinale over 792.
 *
 * Same endpoint and same filters the roll itself sends (`useBrowseRoll` hands
 * this exact object to `useRollSession`), so the promise on the button and the
 * pool behind it cannot drift apart again.
 *
 * Only fetched when filters are active, because that is the only time the button
 * states a number — unfiltered it reads "Roll a random film".
 */
export function useBrowseRollableCount(
  filters: FilterState,
  hasActiveFilters: boolean,
) {
  // The count is stored WITH the query it was measured for. Editing a filter
  // changes the query immediately but the answer arrives a request later, and a
  // count belonging to the previous filter set is exactly the wrong number this
  // hook exists to stop the button from showing.
  const [measured, setMeasured] = useState<{ key: string; count: number } | null>(null);
  const [isFetching, setIsFetching] = useState(false);

  // The request's own identity: page is excluded (it cannot change the pool) and
  // sort is included only because it rides along in the same params.
  const key = filtersToParams(filters).toString();

  useEffect(() => {
    if (!hasActiveFilters) return;

    let cancelled = false;
    // Debounced on the same delay as the home page's count: typing in the search
    // box edits `filters` on every keystroke.
    const timer = window.setTimeout(() => {
      setIsFetching(true);
      void fetchRandomCount(filters)
        .then(({ rollable }) => { if (!cancelled) setMeasured({ key, count: rollable }); })
        // A failed count must not disable the button — the roll itself may well
        // succeed. Falling back to the wordy label is the safe failure.
        .catch(() => { if (!cancelled) setMeasured(null); })
        .finally(() => { if (!cancelled) setIsFetching(false); });
    }, FILTER_COUNT_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [filters, hasActiveFilters, key]);

  // Derived rather than reset in the effect: clearing state inside an effect
  // body cascades a render, and there is nothing to store for a query whose
  // answer we do not have yet.
  const isCurrent = measured?.key === key;

  return {
    rollableCount: hasActiveFilters && isCurrent ? measured.count : null,
    isRollableCountLoading: hasActiveFilters && (isFetching || !isCurrent),
  };
}
