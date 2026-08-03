import type { FilterState } from "@cineroll/types";
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
 */
export function BrowseAdvancedPanel({
  filters,
  setFilters,
  facets,
  activeCount,
  onClearAll,
}: {
  filters: FilterState;
  setFilters: SetFilters;
  facets: BrowseFacets;
  activeCount: number;
  onClearAll: () => void;
}) {
  const bandCounts = countFiltersByBand(filters);

  return (
    <div className="border-t border-white/10 bg-[#090910]/98">
      <div className="mx-auto flex w-full max-w-[100vw] flex-col gap-7 px-4 py-6 sm:max-w-screen-2xl sm:px-6 lg:px-8 xl:px-12">
        <AwardsBand
          filters={filters}
          setFilters={setFilters}
          activeCount={bandCounts.awards}
          counts={facets.counts}
        />
        <FilmBand
          filters={filters}
          setFilters={setFilters}
          activeCount={bandCounts.film}
          counts={facets.counts}
        />
        <DetailsBand
          filters={filters}
          setFilters={setFilters}
          activeCount={bandCounts.details}
          counts={facets.counts}
        />

        {/* The live count used to sit here, at the bottom of ~800px of controls
            where a chip clicked in the top band changed a number off-screen. It
            now rides the sticky primary row (see MatchCount), leaving this row
            as what it always was: the escape hatch. */}
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
    </div>
  );
}
