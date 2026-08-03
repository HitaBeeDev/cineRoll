import type { FilterState } from "@cineroll/types";
import { AwardsBand } from "@/components/browse/awards-band";
import { FilmBand } from "@/components/browse/film-band";
import { DetailsBand } from "@/components/browse/details-band";
import type { BrowseFacetOptions } from "@/hooks/useBrowseFacetOptions";
import type { SetFilters } from "@/lib/browse/filter-descriptors";

/**
 * The expanded "Advanced" filter panel: three labelled bands, ordered by what
 * the app is. Awards define the catalogue, so they lead; Film narrows that set;
 * Details holds the long tail. Each band owns its own controls (see
 * awards-band / film-band / details-band) — this file is only the composition.
 */
export function BrowseAdvancedPanel({
  filters,
  setFilters,
  facets,
}: {
  filters: FilterState;
  setFilters: SetFilters;
  facets: BrowseFacetOptions;
}) {
  const { genres, countries, languages, categories, awardYears, releaseYears } = facets;

  return (
    <div className="border-t border-white/10 bg-[#090910]/98">
      <div className="mx-auto flex w-full max-w-[100vw] flex-col gap-7 px-4 py-6 sm:max-w-screen-2xl sm:px-6 lg:px-8 xl:px-12">
        <AwardsBand
          filters={filters}
          setFilters={setFilters}
          categories={categories}
          awardYears={awardYears}
        />
        <FilmBand
          filters={filters}
          setFilters={setFilters}
          genres={genres}
          releaseYears={releaseYears}
        />
        <DetailsBand
          filters={filters}
          setFilters={setFilters}
          languages={languages}
          countries={countries}
        />
      </div>
    </div>
  );
}
