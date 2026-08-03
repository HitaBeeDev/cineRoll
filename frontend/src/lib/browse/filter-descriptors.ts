import type { FilterState } from "@cineroll/types";
import {
  ceremonyYearRange,
  formatYearRange,
  hasCeremonyYearRange,
  hasYearRange,
} from "@/lib/browse/year-range";
import { awardBodyLabel, contentTypeLabel, countryLabel, languageLabel } from "@/lib/browse/labels";
import { formatGenre } from "@/lib/format";

export type ActiveChip = { key: string; label: string; onRemove: () => void };

function ceremonyChipLabel(filters: FilterState): string {
  const range = ceremonyYearRange(filters);
  const spansOneYear = range.yearMin != null && range.yearMin === range.yearMax;

  return `${formatYearRange(range)} ${spansOneYear ? "ceremony" : "ceremonies"}`;
}

export type SetFilters = (u: Partial<FilterState>) => void;

/**
 * Where a filter's control lives: on the always-visible primary row, or in one
 * of the advanced panel's three bands.
 */
export type FilterBand = "primary" | "awards" | "film" | "details";

/**
 * Sorting is deliberately absent. It reorders the result set without changing
 * which films are in it, so listing it here made every derived number wrong at
 * once: switching to "Newest" lit the Advanced badge, added a "Sort: Newest" ✕
 * chip to a row that otherwise means "constraints you can remove", enabled Clear
 * all, and reported one more active filter beside a total that had not moved.
 * The sort control in the results header is where sorting is shown and changed.
 *
 * Single source of truth for "what does a non-default filter look like." Each
 * descriptor knows whether the filter is active (vs. its default in
 * DEFAULT_FILTERS), which band its control sits in, and how to render/clear its
 * removable chip. The active-chip list, the Advanced badge count and each band's
 * own badge are all derived from this one ordered table — change a filter here
 * and they stay in agreement. (The defaults themselves stay in DEFAULT_FILTERS;
 * this table only references them.)
 */
type FilterDescriptor = {
  band: FilterBand;
  isActive: (f: FilterState) => boolean;
  // Returns one chip per active value, so a multi-select facet shows a removable
  // chip for each selected option (each clearing only its own value).
  toChips: (f: FilterState, set: SetFilters) => ActiveChip[];
};

/** Build the per-value removable chips for one multi-select facet. */
function facetChips<T extends string>(
  keyPrefix: string,
  values: T[],
  labelOf: (v: T) => string,
  clear: (remaining: T[]) => Partial<FilterState>,
  set: SetFilters,
): ActiveChip[] {
  return values.map((v) => ({
    key: `${keyPrefix}:${v}`,
    label: labelOf(v),
    onRemove: () => set({ ...clear(values.filter((x) => x !== v)), page: 1 }),
  }));
}

const FILTER_DESCRIPTORS: FilterDescriptor[] = [
  { band: "primary", isActive: (f) => !!f.search.trim(),
    toChips: (f, set) => [{ key: "search", label: `"${f.search.trim()}"`, onRemove: () => set({ search: "", page: 1 }) }] },
  { band: "primary", isActive: (f) => !!f.person.trim(),
    toChips: (f, set) => [{ key: "person", label: f.person.trim(), onRemove: () => set({ person: "", page: 1 }) }] },
  { band: "details", isActive: (f) => f.femaleDirectorOnly,
    toChips: (_f, set) => [{ key: "femaleDir", label: "Directed by a woman", onRemove: () => set({ femaleDirectorOnly: false, page: 1 }) }] },
  { band: "primary", isActive: (f) => f.awardBodies.length > 0,
    toChips: (f, set) => facetChips("body", f.awardBodies, awardBodyLabel, (awardBodies) => ({ awardBodies }), set) },
  { band: "primary", isActive: (f) => f.winnerOnly || f.nominatedOnly,
    toChips: (f, set) => [f.winnerOnly
      ? { key: "won", label: "Winner", onRemove: () => set({ winnerOnly: false, page: 1 }) }
      : { key: "nom", label: "Nominated", onRemove: () => set({ nominatedOnly: false, page: 1 }) }] },
  { band: "film", isActive: (f) => f.genres.length > 0,
    toChips: (f, set) => facetChips("genre", f.genres, formatGenre, (genres) => ({ genres }), set) },
  { band: "details", isActive: (f) => f.languages.length > 0,
    toChips: (f, set) => facetChips("language", f.languages, languageLabel, (languages) => ({ languages }), set) },
  { band: "details", isActive: (f) => f.countries.length > 0,
    toChips: (f, set) => facetChips("country", f.countries, countryLabel, (countries) => ({ countries }), set) },
  { band: "awards", isActive: (f) => f.categories.length > 0,
    toChips: (f, set) => facetChips("cat", f.categories, (c) => c, (categories) => ({ categories }), set) },
  { band: "awards", isActive: hasCeremonyYearRange,
    toChips: (f, set) => [{
      key: "ceremony-year",
      // "1994 ceremony" / "1970-1979 ceremonies" — the bare year read as a
      // release year beside the release-year chip.
      label: ceremonyChipLabel(f),
      onRemove: () => set({ awardYearMin: null, awardYearMax: null, page: 1 }),
    }] },
  { band: "film", isActive: (f) => f.contentTypes.length > 0,
    toChips: (f, set) => facetChips("type", f.contentTypes, contentTypeLabel, (contentTypes) => ({ contentTypes }), set) },
  { band: "primary", isActive: (f) => f.imdbTopMoviesOnly,
    toChips: (_f, set) => [{ key: "imdbMovies", label: "IMDb Top 250 Films", onRemove: () => set({ imdbTopMoviesOnly: false, page: 1 }) }] },
  { band: "primary", isActive: (f) => f.imdbTopTvOnly,
    toChips: (_f, set) => [{ key: "imdbTv", label: "IMDb Top 250 TV", onRemove: () => set({ imdbTopTvOnly: false, page: 1 }) }] },
  { band: "film", isActive: (f) => f.imdbRatingMin > 0,
    toChips: (f, set) => [{ key: "imdb", label: `IMDb ${f.imdbRatingMin}+`, onRemove: () => set({ imdbRatingMin: 0, page: 1 }) }] },
  { band: "film", isActive: (f) => f.rtScoreMin > 0,
    toChips: (f, set) => [{ key: "rt", label: `RT ${f.rtScoreMin}%+`, onRemove: () => set({ rtScoreMin: 0, page: 1 }) }] },
  { band: "film", isActive: hasYearRange,
    toChips: (f, set) => [{ key: "year-range", label: formatYearRange(f), onRemove: () => set({ yearMin: null, yearMax: null, page: 1 }) }] },
  { band: "film", isActive: (f) => f.runtimeMax != null,
    toChips: (f, set) => [{ key: "runtime", label: `≤ ${f.runtimeMax}m`, onRemove: () => set({ runtimeMax: null, page: 1 }) }] },
  { band: "awards", isActive: (f) => f.nominationCount != null && f.nominationCount > 0,
    toChips: (f, set) => [{ key: "noms", label: `${f.nominationCount}+ noms`, onRemove: () => set({ nominationCount: null, page: 1 }) }] },
];

/** Does any browse filter differ from its default? Derived from the same table
 *  that builds the chips, so "is active" and "has a removable chip" stay in lockstep. */
export function anyFilterActive(filters: FilterState): boolean {
  return FILTER_DESCRIPTORS.some((d) => d.isActive(filters));
}

export function buildActiveChips(filters: FilterState, setFilters: SetFilters): ActiveChip[] {
  return FILTER_DESCRIPTORS.filter((d) => d.isActive(filters)).flatMap((d) => d.toChips(filters, setFilters));
}

/** How many filters are doing something right now, primary row included. */
export function countActiveFilters(filters: FilterState): number {
  return FILTER_DESCRIPTORS.filter((d) => d.isActive(filters)).length;
}

/** Count of active filters that live behind the Advanced disclosure (not the always-visible primary bar). */
export function countAdvancedFilters(filters: FilterState): number {
  return FILTER_DESCRIPTORS.filter((d) => d.band !== "primary" && d.isActive(filters)).length;
}

/**
 * Active filters per advanced band, so each band heading can show what it holds.
 * The totals add up to countAdvancedFilters by construction — one table, one
 * verdict on what "active" means, whichever badge is reading it.
 */
export function countFiltersByBand(filters: FilterState): Record<FilterBand, number> {
  const counts: Record<FilterBand, number> = { primary: 0, awards: 0, film: 0, details: 0 };
  for (const descriptor of FILTER_DESCRIPTORS) {
    if (descriptor.isActive(filters)) counts[descriptor.band] += 1;
  }

  return counts;
}
