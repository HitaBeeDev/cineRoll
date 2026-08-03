import { Shuffle } from "lucide-react";
import type { FilterState, PaginatedFilms } from "@cineroll/types";
import { cn } from "@/lib/utils";
import { FilterSelect } from "@/components/browse/filter-select";
import { PAGE_SIZE, type LoadStatus } from "@/lib/browse/options";
import { sortChoiceFromKey, sortChoiceKey, sortOptionsFor } from "@/lib/browse/sort-choices";
import type { SetFilters } from "@/lib/browse/filter-descriptors";

/**
 * The results summary row: film count + "showing X–Y", the always-present Roll
 * entry point, and the sort control. The scroll anchor for pagination lives on
 * its outer element (`resultsTopRef`).
 *
 * Two groups, not three. The count and Roll are the same subject — Roll acts on
 * the set the count just measured, and says so ("Roll from 1,240 films"), so
 * they belong side by side; a red button between the number and the sort menu
 * split one statement in half and took the eye every time somebody came back to
 * reorder. Sorting is a view control and sits alone at the right edge, where a
 * list's ordering conventionally lives.
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
      className="mb-6 flex scroll-mt-[var(--browse-scroll-offset)] flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
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
            unfiltered it rolls the whole corpus; once filtered it rolls the set. */}
        <button
          type="button"
          disabled={rolling || status === "loading" || total === 0}
          onClick={onRoll}
          className="flex shrink-0 items-center gap-2 self-start rounded-lg border border-[#e8453c]/40 bg-[#e8453c]/10 px-4 py-2.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-[#ff766d] transition-all hover:border-[#e8453c]/70 hover:bg-[#e8453c]/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/40 disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto"
        >
          <Shuffle className={cn("h-3.5 w-3.5", rolling && "animate-spin")} aria-hidden />
          {rolling
            ? "Rolling…"
            : total === 0 && status === "success"
              ? "No matches"
              : hasActiveFilters
                ? (status === "success" ? `Roll from ${total.toLocaleString()} films` : "Roll from these results")
                : "Roll a random film"}
        </button>
      </div>

      {/* One control, and its options carry their own direction — see
          sort-choices.ts for why the asc/desc toggle that used to sit here is
          gone. Relevance joins the list only while there is a query. */}
      <div className="flex w-full items-center gap-2 lg:w-auto">
        <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#7d788e]">
          Sort by
        </span>
        <FilterSelect
          value={sortChoiceKey(filters.sort, filters.sortOrder)}
          onValueChange={(val) => setFilters({ ...sortChoiceFromKey(val), page: 1 })}
          ariaLabel="Sort films"
          align="end"
          className="w-full min-w-[190px] text-[12px] text-[#e8e5f4] lg:w-[190px]"
          options={sortOptionsFor(filters.search.trim().length > 0)}
        />
      </div>
    </div>
  );
}
