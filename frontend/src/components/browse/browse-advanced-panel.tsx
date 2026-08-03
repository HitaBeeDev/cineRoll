import type { FilterState } from "@cineroll/types";
import { cn } from "@/lib/utils";
import { AwardsBand } from "@/components/browse/awards-band";
import { FilmBand } from "@/components/browse/film-band";
import { DetailsBand } from "@/components/browse/details-band";
import type { BrowseFacetOptions } from "@/hooks/useBrowseFacetOptions";
import { countFiltersByBand, type SetFilters } from "@/lib/browse/filter-descriptors";

const plural = (n: number, word: string) => `${n.toLocaleString()} ${word}${n === 1 ? "" : "s"}`;

/** "1,284 films match 3 filters" — or what the whole catalogue holds when none are set. */
function matchSummary(resultCount: number | null, activeCount: number): string {
  if (resultCount == null) return "Counting films…";
  if (activeCount === 0) return `${plural(resultCount, "film")} in the catalogue`;

  return `${plural(resultCount, "film")} match ${plural(activeCount, "filter")}`;
}

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
  resultCount,
  isCounting,
  activeCount,
  onClearAll,
}: {
  filters: FilterState;
  setFilters: SetFilters;
  facets: BrowseFacetOptions;
  /** Films matching the current filters; null until the first result lands. */
  resultCount: number | null;
  isCounting: boolean;
  activeCount: number;
  onClearAll: () => void;
}) {
  const { genres, countries, languages, categories, awardYears, releaseYears } = facets;
  const bandCounts = countFiltersByBand(filters);

  return (
    <div className="border-t border-white/10 bg-[#090910]/98">
      <div className="mx-auto flex w-full max-w-[100vw] flex-col gap-7 px-4 py-6 sm:max-w-screen-2xl sm:px-6 lg:px-8 xl:px-12">
        <AwardsBand
          filters={filters}
          setFilters={setFilters}
          activeCount={bandCounts.awards}
          categories={categories}
          awardYears={awardYears}
        />
        <FilmBand
          filters={filters}
          setFilters={setFilters}
          activeCount={bandCounts.film}
          genres={genres}
          releaseYears={releaseYears}
        />
        <DetailsBand
          filters={filters}
          setFilters={setFilters}
          activeCount={bandCounts.details}
          languages={languages}
          countries={countries}
        />

        {/* The panel covers the results header, so the count comes to the filters
            instead: what the set you are building currently holds, updated as
            you build it, with the escape hatch beside it. */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.09] pt-4">
          <p
            aria-live="polite"
            className={cn(
              "font-[family-name:var(--font-geist-mono)] text-[12px] tabular-nums text-[#8e899e] transition-opacity duration-200",
              // Keep the last count on screen, dimmed, while the next one loads —
              // a number that blanks on every click is worse than a stale one.
              isCounting && "opacity-40",
            )}
          >
            {matchSummary(resultCount, activeCount)}
          </p>

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
