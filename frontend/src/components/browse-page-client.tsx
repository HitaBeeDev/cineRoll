"use client";

import { useCallback, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { AppHeader } from "@/components/app-header";
import { BrowseHero } from "@/components/browse/browse-hero";
import { BrowseFilterBar } from "@/components/browse/browse-filter-bar";
import { BrowseResultsHeader } from "@/components/browse/browse-results-header";
import { BrowseGrid } from "@/components/browse/browse-grid";
import { BrowseRollPanel } from "@/components/browse/browse-roll-panel";
import { useBrowseFilters } from "@/hooks/useBrowseFilters";
import { useBrowseFacetCounts } from "@/hooks/useBrowseFacetCounts";
import { useBrowseResults } from "@/hooks/useBrowseResults";
import { useBrowseAutocomplete } from "@/hooks/useBrowseAutocomplete";
import { useBrowseRoll } from "@/hooks/useBrowseRoll";

/**
 * Browse page composition root: wires the filter/results/autocomplete/roll hooks
 * to the presentational sections. Holds no filtering, fetching, or rendering
 * logic of its own beyond the page layout and the page-change scroll behaviour.
 */
export function BrowsePageClient() {
  const shouldReduceMotion = useReducedMotion();

  const { filters, hasActiveFilters, searchDraft, setSearchDraft, setFilters, resetFilters } = useBrowseFilters();
  const facets = useBrowseFacetCounts(filters);
  const { result, status, slowLoad, firstGridPaint, retry } = useBrowseResults(filters);
  const autocomplete = useBrowseAutocomplete(filters.search, setFilters);
  const browseRoll = useBrowseRoll(filters);

  const resultsTopRef = useRef<HTMLDivElement>(null);
  // The Roll button, so the panel can hand focus back to it on close.
  const rollButtonRef = useRef<HTMLButtonElement>(null);

  // Page changes (unlike filter edits, which deliberately stay put) scroll the
  // results back into view — landing just below the sticky bar via the target's
  // scroll-margin rather than jumping to the very top of the page.
  const goToPage = useCallback(
    (nextPage: number) => {
      setFilters({ page: nextPage });
      resultsTopRef.current?.scrollIntoView({
        behavior: shouldReduceMotion ? "auto" : "smooth",
        block: "start",
      });
    },
    [setFilters, shouldReduceMotion],
  );

  return (
    <div
      className="flex min-h-screen flex-col overflow-x-hidden bg-ink-950 text-fg-hi"
      // Single source for the in-page scroll offset (~app header 56px + sticky
      // filter bar). Named here so the results anchor's scroll-margin references
      // one value instead of a bare magic number.
      style={{ "--browse-scroll-offset": "8rem" } as React.CSSProperties}
    >
      <AppHeader />
      <main className="flex flex-1 flex-col">
        <BrowseHero />

        <BrowseFilterBar
          filters={filters}
          setFilters={setFilters}
          resetFilters={resetFilters}
          searchDraft={searchDraft}
          setSearchDraft={setSearchDraft}
          autocomplete={autocomplete}
          facets={facets}
          // The sticky bar keeps its own count: the results heading scrolls away
          // as soon as the reader is into the grid.
          resultCount={result?.total ?? null}
        />

        <section className="mx-auto w-full max-w-[100vw] flex-1 px-4 py-6 sm:max-w-screen-2xl sm:px-6 sm:py-8 lg:px-8 xl:px-12">
          <BrowseResultsHeader
            resultsTopRef={resultsTopRef}
            result={result}
            status={status}
            filters={filters}
            hasActiveFilters={hasActiveFilters}
            rolling={browseRoll.rolling}
            rollOpen={browseRoll.isOpen}
            rollButtonRef={rollButtonRef}
            onRoll={browseRoll.roll}
            setFilters={setFilters}
          />

          {/* Below the results header, not above it. The Roll button lives in
              that header, so opening the panel above it shoved the control the
              user had just clicked half a screen down; from here the panel only
              ever displaces the grid. The filters that produced the draw stay
              live above, and the results it came from stay right below. */}
          <BrowseRollPanel
            open={browseRoll.isOpen}
            rolling={browseRoll.rolling}
            film={browseRoll.film}
            error={browseRoll.error}
            returnFocusRef={rollButtonRef}
            onClose={browseRoll.close}
            onRoll={browseRoll.roll}
            onClearFilters={resetFilters}
            onEngage={browseRoll.markEngaged}
            onNotInterested={browseRoll.markRejected}
          />

          <BrowseGrid
            status={status}
            result={result}
            filters={filters}
            slowLoad={slowLoad}
            firstGridPaint={firstGridPaint}
            onRetry={retry}
            onResetFilters={resetFilters}
            onPageChange={goToPage}
          />
        </section>
      </main>

    </div>
  );
}
