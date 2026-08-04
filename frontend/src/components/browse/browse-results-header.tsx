"use client";

import { Check, Share2, Shuffle } from "lucide-react";
import type { FilterState, PaginatedFilms } from "@cineroll/types";
import { cn } from "@/lib/utils/cn";
import { FilterSelect } from "@/components/browse/filter-select";
import { useShareFilters } from "@/hooks/useShareFilters";
import { PAGE_SIZE } from "@/lib/browse/options/page-size";
import type { LoadStatus } from "@/lib/browse/options/load-status";
import { sortChoiceFromKey } from "@/lib/browse/sort-choices/sort-choice-from-key";
import { sortChoiceKey } from "@/lib/browse/sort-choices/sort-choice-key";
import { sortOptionsFor } from "@/lib/browse/sort-choices/sort-options-for";
import type { SetFilters } from "@/lib/browse/filter-descriptors/set-filters";

/**
 * The results summary row: film count + "showing X–Y", the Roll entry point, and
 * the view controls. The scroll anchor for pagination lives on its outer element
 * (`resultsTopRef`).
 *
 * Three slots, not two: what the set IS on the left, what to DO with it in the
 * middle, how to LOOK at it on the right. Roll used to sit tucked against the
 * count, on the argument that it acts on the set the number just measured — true,
 * except the button says so itself ("Roll from 1,240 films"), so the adjacency was
 * paying for something already stated in words. What it cost was the page's one
 * real action reading as a footnote to a heading. Centred and filled it is the
 * thing the eye lands on, which is what it should have been on a site whose whole
 * proposition is that it will pick for you.
 *
 * The centre column is sized to the button, so the heading and the view controls
 * keep the outer thirds and the button stays put as the count's width changes.
 */
export function BrowseResultsHeader({
  resultsTopRef,
  result,
  status,
  filters,
  hasActiveFilters,
  rolling,
  onRoll,
  setFilters,
}: {
  resultsTopRef: React.RefObject<HTMLDivElement | null>;
  result: PaginatedFilms | null;
  status: LoadStatus;
  filters: FilterState;
  hasActiveFilters: boolean;
  rolling: boolean;
  onRoll: () => void;
  setFilters: SetFilters;
}) {
  const total    = result?.total ?? 0;
  const page     = result?.page ?? filters.page;
  // Window is derived from the page size the server reports it applied and the
  // rows it actually returned, so "Showing X–Y" stays correct even on a short
  // final page or a server-clamped page size.
  const pageSize     = result?.pageSize ?? PAGE_SIZE;
  const showingStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingEnd   = result ? showingStart + result.films.length - 1 : 0;
  const hasResult    = result != null;
  // Keep the last count on screen (dimmed) while a new query is in flight.
  const isStaleCount = status === "loading" && hasResult;
  const { isCopied, share } = useShareFilters(filters);

  function resultsHeading(): string {
    if (!hasResult) return status === "loading" ? "Loading films" : "Browse results";
    // The grid's own empty state carries the advice ("try adjusting your
    // filters"); the heading only has to name the state.
    if (total === 0) return "No films match";

    return `Showing ${showingStart.toLocaleString()}–${showingEnd.toLocaleString()} of ${total.toLocaleString()}`;
  }

  return (
    <div
      ref={resultsTopRef}
      className="mb-6 flex scroll-mt-[var(--browse-scroll-offset)] flex-col gap-4 border-b border-white/10 pb-5 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-6"
    >
      {/* The one place the total is stated. The sticky bar used to carry a live
          count beside the Advanced button as well, which put the same number on
          screen twice in two wordings; this heading says it once, and says where
          in the set the current page sits besides. */}
      <h2
        aria-live="polite"
        className={cn(
          "text-xl font-semibold tracking-normal text-[#f2eff8] transition-opacity duration-200 sm:text-2xl",
          isStaleCount && "opacity-40",
        )}
      >
        {resultsHeading()}
      </h2>

      {/* Roll is the product's signature, so its entry point is always present —
          unfiltered it rolls the whole corpus; once filtered it rolls the set.

          Filled, not outlined. Every other control on this page is a tinted
          ghost, which is right for the ones that adjust a view and wrong for the
          one that produces an answer; solid accent is the only weight left that
          reads as "this is the button". The text is near-black rather than white
          because white on #e8453c is 3.9:1 — under AA at this size — and the same
          fill already carries dark text on the mobile filter sheet's Show results
          button, so the two primary actions match.

          Lift and glow on hover, and nothing at all on disabled: a button that
          rises when there is nothing to roll is a promise it cannot keep. */}
      <button
        type="button"
        disabled={rolling || status === "loading" || total === 0}
        onClick={onRoll}
        className={cn(
          "flex shrink-0 items-center justify-center gap-2.5 self-center rounded-full bg-[#e8453c] px-6 py-3",
          "font-[family-name:var(--font-geist-mono)] text-[12px] font-semibold uppercase tracking-[0.16em] text-[#09090f]",
          "shadow-[0_10px_34px_-12px_rgba(232,69,60,0.9)] transition-all duration-200",
          "hover:-translate-y-0.5 hover:bg-[#ff5c52] hover:shadow-[0_16px_44px_-12px_rgba(232,69,60,1)]",
          "active:translate-y-0 active:shadow-[0_6px_20px_-10px_rgba(232,69,60,0.9)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff766d] focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080d]",
          "disabled:cursor-not-allowed disabled:bg-[#e8453c]/35 disabled:text-[#09090f]/60 disabled:shadow-none",
          "disabled:hover:translate-y-0 disabled:hover:bg-[#e8453c]/35",
        )}
      >
        <Shuffle className={cn("h-4 w-4", rolling && "animate-spin")} aria-hidden />
        {rolling
          ? "Rolling…"
          : total === 0 && status === "success"
            ? "No matches"
            : hasActiveFilters
              ? (status === "success" ? `Roll from ${total.toLocaleString()} films` : "Roll from these results")
              : "Roll a random film"}
      </button>

      {/* View controls. Sort has always been here, where a list's ordering
          conventionally lives; Share joins it because handing the view to someone
          else is the same kind of act — it changes nothing about the set, only
          what you do with the arrangement in front of you.

          Sharing was free: every filter, the page and the sort already round-trip
          through the URL, so the link is the address bar with a button on it. It
          says "Copied" in place rather than raising a toast, since the thing it
          confirms is small and the confirmation belongs where the click was. */}
      <div className="flex w-full items-center gap-2 lg:w-auto lg:justify-self-end">
        <button
          type="button"
          onClick={() => { void share(); }}
          aria-label="Copy a link to this view"
          className="flex h-9 shrink-0 items-center gap-2 rounded-md border border-white/10 bg-white/[0.045] px-3 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.12em] text-[#b8b5c8] transition-colors hover:border-white/25 hover:text-[#f1eff8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/40"
        >
          {isCopied ? (
            <Check className="h-3.5 w-3.5 text-[#7ee0a8]" aria-hidden />
          ) : (
            <Share2 className="h-3.5 w-3.5" aria-hidden />
          )}
          {isCopied ? "Copied" : "Share"}
        </button>

        {/* One control, and its options carry their own direction — see
            sort-choices.ts for why the asc/desc toggle that used to sit here is
            gone. Relevance joins the list only while there is a query. */}
        {/* The caption goes at the narrowest widths, not the control: the select
            names itself for a screen reader either way, and Share + caption +
            a 190px menu do not fit on a phone without one of them wrapping. */}
        <span className="ml-auto hidden shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#8e899e] sm:inline lg:ml-2">
          Sort by
        </span>
        <FilterSelect
          value={sortChoiceKey(filters.sort, filters.sortOrder)}
          onValueChange={(val) => setFilters({ ...sortChoiceFromKey(val), page: 1 })}
          ariaLabel="Sort films"
          align="end"
          className="min-w-0 flex-1 text-[12px] text-[#e8e5f4] lg:w-[190px] lg:min-w-[190px] lg:flex-none"
          options={sortOptionsFor(filters.search.trim().length > 0)}
        />
      </div>
    </div>
  );
}
