import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { FilterState } from "@cineroll/types";
import { cn } from "@/lib/utils";
import { BrowseSearchBox } from "@/components/browse/browse-search-box";
import { ToggleStrip } from "@/components/browse/toggle-strip";
import { SegmentedControl } from "@/components/browse/segmented-control";
import { ActiveFilterChips } from "@/components/browse/active-filter-chips";
import { BrowseAdvancedPanel } from "@/components/browse/browse-advanced-panel";
import { AWARD_BODY_OPTIONS, STATUS_OPTIONS, type AwardStatus } from "@/lib/browse/options";
import { statusFromFilters, statusToUpdates, toggleValue } from "@/lib/browse/filter-updates";
import {
  buildActiveChips,
  countAdvancedFilters,
  type SetFilters,
} from "@/lib/browse/filter-descriptors";
import type { BrowseFacetOptions } from "@/hooks/useBrowseFacetOptions";
import type { BrowseAutocomplete } from "@/hooks/useBrowseAutocomplete";

/**
 * The sticky filter bar: search + scope + award status + the Advanced
 * disclosure on the primary row, the removable chips beneath it, and the
 * expanded advanced panel. Owns only the panel's open/closed state; every
 * filter value flows through `setFilters`.
 */
export function BrowseFilterBar({
  filters,
  setFilters,
  resetFilters,
  searchDraft,
  setSearchDraft,
  autocomplete,
  facets,
}: {
  filters: FilterState;
  setFilters: SetFilters;
  resetFilters: () => void;
  searchDraft: string;
  setSearchDraft: (value: string) => void;
  autocomplete: BrowseAutocomplete;
  facets: BrowseFacetOptions;
}) {
  const [showMore, setShowMore] = useState(false);

  const awardStatus   = statusFromFilters(filters);
  const activeChips   = buildActiveChips(filters, setFilters);
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

        {/* Primary row — search + scope on the left; award status and the
            Advanced disclosure grouped at the right edge. */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 pt-3 pb-2.5 xl:flex-nowrap">
          <BrowseSearchBox value={searchDraft} onValueChange={onSearchChange} autocomplete={autocomplete} />

          <ToggleStrip
            ariaLabel="Browse scope"
            className="xl:shrink-0"
            items={AWARD_BODY_OPTIONS.map((opt) => ({
              key: opt.value,
              label: opt.label,
              active: filters.awardBodies.includes(opt.value),
              onToggle: () => setFilters({ awardBodies: toggleValue(filters.awardBodies, opt.value), page: 1 }),
            }))}
          />

          <SegmentedControl<AwardStatus>
            ariaLabel="Award status"
            options={STATUS_OPTIONS}
            value={awardStatus}
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
        <BrowseAdvancedPanel filters={filters} setFilters={setFilters} facets={facets} />
      )}
    </div>
  );
}
