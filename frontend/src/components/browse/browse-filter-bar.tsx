import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { FacetCounts, FilterState } from "@cineroll/types";
import { cn } from "@/lib/utils/cn";
import { BrowseSearchBox } from "@/components/browse/browse-search-box";
import { ToggleStrip } from "@/components/browse/toggle-strip";
import { SegmentedControl } from "@/components/browse/segmented-control";
import { ActiveFilterChips } from "@/components/browse/active-filter-chips";
import { BrowseAdvancedPanel } from "@/components/browse/browse-advanced-panel";
import { AWARD_BODY_OPTIONS } from "@/lib/browse/options/award-body-options";
import { STATUS_OPTIONS } from "@/lib/browse/options/status-options";
import type { AwardStatus } from "@/lib/browse/options/award-status";
import { statusFromFilters } from "@/lib/browse/filter-updates/status-from-filters";
import { statusToUpdates } from "@/lib/browse/filter-updates/status-to-updates";
import { toggleValue } from "@/lib/browse/filter-updates/toggle-value";
import { buildActiveChips } from "@/lib/browse/filter-descriptors/build-active-chips";
import { countActiveFilters } from "@/lib/browse/filter-descriptors/count-active-filters";
import { countAdvancedFilters } from "@/lib/browse/filter-descriptors/count-advanced-filters";
import type { SetFilters } from "@/lib/browse/filter-descriptors/set-filters";
import { countOf } from "@/lib/browse/facet-options/count-of";
import { useIsCompactViewport } from "@/hooks/useIsCompactViewport";
import type { BrowseAutocomplete } from "@/hooks/useBrowseAutocomplete";

/**
 * The sticky filter bar: search + award ceremony + award result + the Advanced
 * disclosure on the primary row, the removable chips beneath it, and the
 * expanded advanced panel. Owns only the panel's open/closed state; every
 * filter value flows through `setFilters`.
 *
 * Ceremony and result stay out here rather than joining the panel's Awards band:
 * they are the catalogue's primary axis, and burying the two most-used controls
 * behind a disclosure would cost a click on nearly every session.
 */
export function BrowseFilterBar({
  filters,
  setFilters,
  resetFilters,
  searchDraft,
  setSearchDraft,
  autocomplete,
  facets,
  resultCount,
}: {
  filters: FilterState;
  setFilters: SetFilters;
  resetFilters: () => void;
  searchDraft: string;
  setSearchDraft: (value: string) => void;
  autocomplete: BrowseAutocomplete;
  facets: FacetCounts;
  /** Films matching the current filters; null until the first result lands.
   *  Shown by the advanced panel, not by the sticky bar itself — the results
   *  header already states the total whenever the panel is shut. */
  resultCount: number | null;
}) {
  const [showMore, setShowMore] = useState(false);
  const compact = useIsCompactViewport();

  const awardStatus   = statusFromFilters(filters);
  const activeChips   = buildActiveChips(filters, setFilters);
  const activeCount   = countActiveFilters(filters);
  const advancedCount = countAdvancedFilters(filters);

  const onSearchChange = (value: string) => {
    setSearchDraft(value);
    setFilters({ search: value, page: 1 });
  };

  const clearAll = () => {
    resetFilters();
    setShowMore(false);
  };

  return (
    <div className="sticky top-14 z-40 max-w-[100vw] border-b border-[#1c1a25] bg-[#08080d]/92 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="mx-auto w-full max-w-[100vw] px-4 sm:max-w-screen-2xl sm:px-6 lg:px-8 xl:px-12">

        {/* Primary row — search + ceremony on the left; result and the Advanced
            disclosure grouped at the right edge. Aligned to the bottom, so the
            captioned strips sit on the same baseline as the uncaptioned search
            box and Advanced button. */}
        <div className="flex flex-wrap items-end gap-x-2 gap-y-2 pt-3 pb-2.5 xl:flex-nowrap">
          <BrowseSearchBox value={searchDraft} onValueChange={onSearchChange} autocomplete={autocomplete} />

          <ToggleStrip
            label="Award Ceremony"
            ariaLabel="Award ceremony"
            className="xl:shrink-0"
            items={AWARD_BODY_OPTIONS.map((opt) => ({
              key: opt.value,
              label: opt.label,
              active: filters.awardBodies.includes(opt.value),
              // Each ceremony's count is measured with the ceremony filter itself
              // lifted, so these read as "what switching to Cannes would leave",
              // not "0 for every ceremony you have not selected".
              count: countOf(facets.awardBodies, opt.value),
              onToggle: () => setFilters({ awardBodies: toggleValue(filters.awardBodies, opt.value), page: 1 }),
            }))}
          />

          <SegmentedControl<AwardStatus>
            label="Award Result"
            ariaLabel="Award result"
            options={STATUS_OPTIONS}
            value={awardStatus}
            neutralValue="any"
            onChange={(value) => setFilters(statusToUpdates(value))}
            className="xl:shrink-0"
          />

          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            aria-expanded={showMore}
            className={cn(
              "flex h-10 shrink-0 items-center gap-2 rounded-md border px-3.5 font-[family-name:var(--font-geist-mono)] text-[12px] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c]/40",
              showMore || advancedCount > 0
                ? "border-[#e8453c]/55 bg-[#e8453c]/12 text-[#ff766d]"
                : "border-white/10 bg-white/[0.045] text-[#b8b5c8] hover:border-white/20 hover:text-[#f1eff8]",
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
            Advanced
            {advancedCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#e8453c] px-1 text-[10px] font-semibold leading-none text-white">
                {advancedCount}
              </span>
            )}
          </button>
        </div>

        <ActiveFilterChips chips={activeChips} onClearAll={clearAll} />
      </div>

      {showMore && (
        <BrowseAdvancedPanel
          filters={filters}
          setFilters={setFilters}
          facets={facets}
          activeCount={activeCount}
          compact={compact}
          resultCount={resultCount}
          onClose={() => setShowMore(false)}
          // Unlike the chip bar's Clear all, this one leaves the panel open: it
          // is a "start over" in the middle of building a set, not a way out.
          onClearAll={resetFilters}
        />
      )}
    </div>
  );
}
