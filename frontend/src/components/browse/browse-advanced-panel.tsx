import { useEffect } from "react";
import { X } from "lucide-react";
import type { FilterState } from "@cineroll/types";
import { cn } from "@/lib/utils";
import { AwardsBand } from "@/components/browse/awards-band";
import { FilmBand } from "@/components/browse/film-band";
import { DetailsBand } from "@/components/browse/details-band";
import type { BrowseFacets } from "@/hooks/useBrowseFacetCounts";
import { countFiltersByBand, type SetFilters } from "@/lib/browse/filter-descriptors";

/**
 * The expanded "Advanced" filter panel: three labelled bands, ordered by what
 * the app is. Awards define the catalogue, so they lead; Film narrows that set;
 * Details holds the long tail. Each band owns its own controls (see
 * awards-band / film-band / details-band) — this file is only the composition,
 * the per-band active counts, and the footer.
 *
 * `compact` is the same three bands as a bottom sheet. Inline, the panel's three
 * columns collapse to one on a phone: about three screens of controls pushed
 * under a sticky bar, with the results they filter somewhere far below and no
 * way back but scrolling. As a sheet it owns the viewport, scrolls itself,
 * collapses its bands to a contents page, and closes on a button that says how
 * many films are waiting — so the filtering has an end.
 */
export function BrowseAdvancedPanel({
  filters,
  setFilters,
  facets,
  activeCount,
  onClearAll,
  compact = false,
  resultCount,
  onClose,
}: {
  filters: FilterState;
  setFilters: SetFilters;
  facets: BrowseFacets;
  activeCount: number;
  onClearAll: () => void;
  /** Render as a bottom sheet — the viewport is too narrow for the inline panel. */
  compact?: boolean;
  /** Films matching the current filters; only the sheet shows them, on its close button. */
  resultCount?: number | null;
  onClose?: () => void;
}) {
  const bandCounts = countFiltersByBand(filters);

  // The sheet covers the page, so the page must not scroll behind it — otherwise
  // flicking past the end of the sheet's own scroll drags the results underneath.
  useEffect(() => {
    if (!compact) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [compact]);

  return (
    <div
      className={cn(
        "border-t border-white/10 bg-[#090910]/98",
        compact && "fixed inset-0 z-50 flex flex-col border-t-0 bg-[#090910]",
      )}
      role={compact ? "dialog" : undefined}
      aria-modal={compact || undefined}
      aria-label={compact ? "Filters" : undefined}
    >
      {compact && (
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
          <h2 className="font-[family-name:var(--font-geist-mono)] text-[13px] font-semibold uppercase tracking-[0.16em] text-[#f1eff8]">
            Filters
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="flex h-8 w-8 items-center justify-center rounded-md text-[#a9a5bc] transition-colors hover:bg-white/[0.06] hover:text-[#f1eff8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/40"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}

      <div
        className={cn(
          "mx-auto flex w-full max-w-[100vw] flex-col gap-7 px-4 py-6 sm:max-w-screen-2xl sm:px-6 lg:px-8 xl:px-12",
          compact && "min-h-0 flex-1 overflow-y-auto",
        )}
      >
        <AwardsBand
          filters={filters}
          setFilters={setFilters}
          activeCount={bandCounts.awards}
          counts={facets.counts}
          collapsible={compact}
        />
        <FilmBand
          filters={filters}
          setFilters={setFilters}
          activeCount={bandCounts.film}
          counts={facets.counts}
          collapsible={compact}
        />
        <DetailsBand
          filters={filters}
          setFilters={setFilters}
          activeCount={bandCounts.details}
          counts={facets.counts}
          collapsible={compact}
        />

        {/* The live count rides the sticky primary row on desktop (see
            MatchCount), leaving this row as the escape hatch. The sheet covers
            that row, so there the count comes back — on the button that closes
            it, where it answers "is it worth applying yet". */}
        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-white/[0.09] pt-4">
          <button
            type="button"
            onClick={onClearAll}
            disabled={activeCount === 0}
            className="font-[family-name:var(--font-geist-mono)] text-[12px] text-[#a9a5bc] underline decoration-white/25 underline-offset-4 transition-colors hover:text-[#ff766d] hover:decoration-[#e8453c]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/30 disabled:cursor-not-allowed disabled:text-[#56515f] disabled:no-underline"
          >
            Clear all filters
          </button>
        </div>
      </div>

      {compact && (
        <div className="shrink-0 border-t border-white/10 bg-[#0b0b12] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-full items-center justify-center rounded-lg bg-[#e8453c] font-[family-name:var(--font-geist-mono)] text-[13px] font-semibold text-[#09090f] transition-colors hover:bg-[#ff5c52] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/40"
          >
            {resultCount == null
              ? "Show results"
              : `Show ${resultCount.toLocaleString()} ${resultCount === 1 ? "film" : "films"}`}
          </button>
        </div>
      )}
    </div>
  );
}
