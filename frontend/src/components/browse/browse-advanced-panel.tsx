import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { FacetCounts, FilterState } from "@cineroll/types";
import { cn } from "@/lib/utils";
import { AwardsBand } from "@/components/browse/awards-band";
import { FilmBand } from "@/components/browse/film-band";
import { DetailsBand } from "@/components/browse/details-band";
import { countFiltersByBand, type SetFilters } from "@/lib/browse/filter-descriptors";

/**
 * The expanded "Advanced" filter panel: three labelled bands, ordered by what
 * the app is. Awards define the catalogue, so they lead; Film narrows that set;
 * Details holds the long tail. Each band owns its own controls (see
 * awards-band / film-band / details-band) — this file is only the composition,
 * the per-band active counts, and the footer.
 *
 * `compact` is the same three bands as a full-screen menu. Inline, the panel's
 * three columns collapse to one on a phone: about three screens of controls
 * pushed under a sticky bar, with the results they filter somewhere far below and
 * no way back but scrolling. Full-screen it owns the viewport edge to edge,
 * scrolls itself, opens on a contents page of three collapsed bands, and closes
 * on a button that says how many films are waiting — so the filtering has an end.
 *
 * It is rendered through a portal onto <body>, and that is load-bearing rather
 * than tidiness. The sticky filter bar that owns this panel carries
 * `backdrop-blur`, and a backdrop-filter makes an element the containing block
 * for every fixed-position descendant — so `fixed inset-0` resolved against the
 * bar instead of the viewport and the "full screen" menu rendered as a short
 * block inside the bar with the results still scrolling below it. The portal
 * moves it out from under that ancestor, where `fixed` means the viewport again.
 */
function ClearAllButton({
  onClearAll,
  disabled,
}: {
  onClearAll: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClearAll}
      disabled={disabled}
      className="shrink-0 font-[family-name:var(--font-geist-mono)] text-[12px] text-[#a9a5bc] underline decoration-white/25 underline-offset-4 transition-colors hover:text-[#ff766d] hover:decoration-[#e8453c]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/30 disabled:cursor-not-allowed disabled:text-[#56515f] disabled:no-underline"
    >
      Clear all filters
    </button>
  );
}

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
  facets: FacetCounts;
  activeCount: number;
  onClearAll: () => void;
  /** Render as a bottom sheet — the viewport is too narrow for the inline panel. */
  compact?: boolean;
  /** Films matching the current filters; null until the first result lands. The
   *  sheet puts it on its close button, the inline panel in its footer. */
  resultCount?: number | null;
  onClose?: () => void;
}) {
  const bandCounts = countFiltersByBand(filters);

  // The menu covers the page, so the page must not scroll behind it — otherwise
  // flicking past the end of its own scroll drags the results underneath.
  useEffect(() => {
    if (!compact) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [compact]);

  // Escape closes it, as any full-screen overlay owes the keyboard.
  useEffect(() => {
    if (!compact || !onClose) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [compact, onClose]);

  const panel = (
    <div
      className={cn(
        "border-t border-white/10 bg-[#090910]/98",
        // Above the app header (z-50) as well as the filter bar: "full height"
        // has to mean the whole viewport, not the part below the nav.
        compact && "fixed inset-0 z-[60] flex flex-col border-t-0 bg-[#08080d]",
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
          counts={facets}
          collapsible={compact}
        />
        <FilmBand
          filters={filters}
          setFilters={setFilters}
          activeCount={bandCounts.film}
          counts={facets}
          collapsible={compact}
        />
        <DetailsBand
          filters={filters}
          setFilters={setFilters}
          activeCount={bandCounts.details}
          counts={facets}
          collapsible={compact}
        />

        {/* Inline, the escape hatch closes the band stack. Full-screen it belongs
            in the footer beside the way out — on a tall empty menu a link left
            floating under three collapsed rows reads as unattached to anything.
            Inline it now has the running total for company: three bands of
            controls is a long way from the results header that states it, and
            the answer to "did that last chip help?" should be at the bottom of
            the thing that asked. Same number the header shows, so it is stated
            twice on screen only while the panel is open over it. */}
        {!compact && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.09] pt-4">
            <span
              aria-live="polite"
              className="font-[family-name:var(--font-geist-mono)] text-[12px] text-[#a9a5bc]"
            >
              {resultCount == null
                ? "Counting films…"
                : `${resultCount.toLocaleString()} ${resultCount === 1 ? "film matches" : "films match"}`}
            </span>
            <ClearAllButton onClearAll={onClearAll} disabled={activeCount === 0} />
          </div>
        )}
      </div>

      {compact && (
        <div className="flex shrink-0 items-center gap-3 border-t border-white/10 bg-[#0b0b12] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <ClearAllButton onClearAll={onClearAll} disabled={activeCount === 0} />
          <button
            type="button"
            onClick={onClose}
            className="ml-auto flex h-11 flex-1 items-center justify-center rounded-lg bg-[#e8453c] px-5 font-[family-name:var(--font-geist-mono)] text-[13px] font-semibold text-[#09090f] transition-colors hover:bg-[#ff5c52] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/40"
          >
            {resultCount == null
              ? "Show results"
              : `Show ${resultCount.toLocaleString()} ${resultCount === 1 ? "film" : "films"}`}
          </button>
        </div>
      )}
    </div>
  );

  return compact ? createPortal(panel, document.body) : panel;
}
