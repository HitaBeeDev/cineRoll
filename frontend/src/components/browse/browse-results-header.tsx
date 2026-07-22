import { ArrowDownWideNarrow, ArrowUpNarrowWide, Shuffle } from "lucide-react";
import type { FilterState, PaginatedFilms } from "@cineroll/types";
import { cn } from "@/lib/utils";
import { FilterSelect } from "@/components/browse/filter-select";
import { PAGE_SIZE, SORT_OPTIONS, type LoadStatus } from "@/lib/browse/options";
import type { SetFilters } from "@/lib/browse/filter-descriptors";

/**
 * The results summary row: film count + "showing X–Y", the always-present Roll
 * entry point, and the sort controls. The scroll anchor for pagination lives on
 * its outer element (`resultsTopRef`).
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

  return (
    <div
      ref={resultsTopRef}
      className="mb-6 flex scroll-mt-[var(--browse-scroll-offset)] flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between"
    >
      <div>
        <h2
          aria-live="polite"
          className={cn(
            "text-xl font-semibold tracking-normal text-[#f2eff8] transition-opacity duration-200 sm:text-2xl",
            isStaleCount && "opacity-40",
          )}
        >
          {hasResult
            ? `${total.toLocaleString()} ${total === 1 ? "film" : "films"}`
            : status === "loading"
              ? "Loading films"
              : "Browse results"}
        </h2>
        {hasResult && total > 0 && (
          <p
            className={cn(
              "mt-1 font-[family-name:var(--font-geist-mono)] text-[12px] tabular-nums text-[#817c91] transition-opacity duration-200",
              isStaleCount && "opacity-40",
            )}
          >
            Showing {showingStart.toLocaleString()}-{showingEnd.toLocaleString()} of {total.toLocaleString()}
          </p>
        )}
      </div>

      {/* Roll is the product's signature, so its entry point is always present —
          unfiltered it rolls the whole corpus; once filtered it rolls the set. */}
      <button
        type="button"
        disabled={rolling || status === "loading" || total === 0}
        onClick={onRoll}
        className="flex shrink-0 items-center gap-2 rounded-lg border border-[#e8453c]/40 bg-[#e8453c]/10 px-4 py-2.5 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.16em] text-[#ff766d] transition-all hover:border-[#e8453c]/70 hover:bg-[#e8453c]/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/40 disabled:cursor-not-allowed disabled:opacity-40"
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

      <div className="flex w-full items-center gap-2 lg:w-auto">
        <span className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#7d788e]">
          Sort by
        </span>
        <FilterSelect
          value={filters.sort}
          onValueChange={(val) => setFilters({ sort: val as FilterState["sort"], page: 1 })}
          ariaLabel="Sort films"
          className="w-full min-w-[150px] text-[12px] text-[#e8e5f4] lg:w-[150px]"
          options={SORT_OPTIONS}
        />
        <button
          type="button"
          aria-label={filters.sortOrder === "asc" ? "Switch to descending" : "Switch to ascending"}
          title={filters.sortOrder === "asc" ? "Ascending" : "Descending"}
          onClick={() => setFilters({ sortOrder: filters.sortOrder === "asc" ? "desc" : "asc", page: 1 })}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.045] text-[#b8b5c8] transition-colors hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/35"
        >
          {filters.sortOrder === "asc"
            ? <ArrowUpNarrowWide className="h-4 w-4" aria-hidden />
            : <ArrowDownWideNarrow className="h-4 w-4" aria-hidden />}
        </button>
      </div>
    </div>
  );
}
