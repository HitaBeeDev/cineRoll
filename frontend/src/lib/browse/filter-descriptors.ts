import type { FilterState } from "@cineroll/types";
import { DECADE_MIN, DECADE_MAX } from "@/lib/browse/options";
import { awardBodyLabel, contentTypeLabel, countryLabel, languageLabel, sortLabel } from "@/lib/browse/labels";

export type ActiveChip = { key: string; label: string; onRemove: () => void };

export type SetFilters = (u: Partial<FilterState>) => void;

/**
 * Single source of truth for "what does a non-default filter look like." Each
 * descriptor knows whether the filter is active (vs. its default in
 * DEFAULT_FILTERS), whether it lives behind the Advanced disclosure, and how to
 * render/clear its removable chip. The active-chip list and the advanced badge
 * count are both derived from this one ordered table — change a filter here and
 * both stay in agreement. (The defaults themselves stay in DEFAULT_FILTERS; this
 * table only references them.)
 */
type FilterDescriptor = {
  advanced: boolean;
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
  { advanced: false, isActive: (f) => !!f.search.trim(),
    toChips: (f, set) => [{ key: "search", label: `"${f.search.trim()}"`, onRemove: () => set({ search: "", page: 1 }) }] },
  { advanced: false, isActive: (f) => !!f.person.trim(),
    toChips: (f, set) => [{ key: "person", label: f.person.trim(), onRemove: () => set({ person: "", page: 1 }) }] },
  { advanced: true, isActive: (f) => f.femaleDirectorOnly,
    toChips: (_f, set) => [{ key: "femaleDir", label: "Female-directed", onRemove: () => set({ femaleDirectorOnly: false, page: 1 }) }] },
  { advanced: false, isActive: (f) => f.awardBodies.length > 0,
    toChips: (f, set) => facetChips("body", f.awardBodies, awardBodyLabel, (awardBodies) => ({ awardBodies }), set) },
  { advanced: false, isActive: (f) => f.winnerOnly || f.nominatedOnly,
    toChips: (f, set) => [f.winnerOnly
      ? { key: "won", label: "Won", onRemove: () => set({ winnerOnly: false, page: 1 }) }
      : { key: "nom", label: "Nominated", onRemove: () => set({ nominatedOnly: false, page: 1 }) }] },
  { advanced: true, isActive: (f) => f.genres.length > 0,
    toChips: (f, set) => facetChips("genre", f.genres, (g) => g, (genres) => ({ genres }), set) },
  { advanced: true, isActive: (f) => f.languages.length > 0,
    toChips: (f, set) => facetChips("language", f.languages, languageLabel, (languages) => ({ languages }), set) },
  { advanced: true, isActive: (f) => f.countries.length > 0,
    toChips: (f, set) => facetChips("country", f.countries, countryLabel, (countries) => ({ countries }), set) },
  { advanced: true, isActive: (f) => f.categories.length > 0,
    toChips: (f, set) => facetChips("cat", f.categories, (c) => c, (categories) => ({ categories }), set) },
  { advanced: true, isActive: (f) => f.awardYear != null,
    toChips: (f, set) => [{ key: "year", label: String(f.awardYear), onRemove: () => set({ awardYear: null, page: 1 }) }] },
  { advanced: true, isActive: (f) => f.contentTypes.length > 0,
    toChips: (f, set) => facetChips("type", f.contentTypes, contentTypeLabel, (contentTypes) => ({ contentTypes }), set) },
  { advanced: false, isActive: (f) => f.imdbTopMoviesOnly,
    toChips: (_f, set) => [{ key: "imdbMovies", label: "IMDb Top 250 Films", onRemove: () => set({ imdbTopMoviesOnly: false, page: 1 }) }] },
  { advanced: false, isActive: (f) => f.imdbTopTvOnly,
    toChips: (_f, set) => [{ key: "imdbTv", label: "IMDb Top 250 TV", onRemove: () => set({ imdbTopTvOnly: false, page: 1 }) }] },
  { advanced: false, isActive: (f) => f.sort !== "awards",
    toChips: (f, set) => [{ key: "sort", label: `Sort: ${sortLabel(f.sort)}`, onRemove: () => set({ sort: "awards", page: 1 }) }] },
  { advanced: true, isActive: (f) => f.imdbRatingMin > 0,
    toChips: (f, set) => [{ key: "imdb", label: `IMDb ${f.imdbRatingMin}+`, onRemove: () => set({ imdbRatingMin: 0, page: 1 }) }] },
  { advanced: true, isActive: (f) => f.rtScoreMin > 0,
    toChips: (f, set) => [{ key: "rt", label: `RT ${f.rtScoreMin}%+`, onRemove: () => set({ rtScoreMin: 0, page: 1 }) }] },
  { advanced: true, isActive: (f) => f.decadeMin !== DECADE_MIN || f.decadeMax !== DECADE_MAX,
    toChips: (f, set) => [{ key: "decade", label: `${f.decadeMin}–${f.decadeMax}`, onRemove: () => set({ decadeMin: DECADE_MIN, decadeMax: DECADE_MAX, page: 1 }) }] },
  { advanced: true, isActive: (f) => f.runtimeMax != null,
    toChips: (f, set) => [{ key: "runtime", label: `≤ ${f.runtimeMax}m`, onRemove: () => set({ runtimeMax: null, page: 1 }) }] },
  { advanced: true, isActive: (f) => f.nominationCount != null && f.nominationCount > 0,
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

/** Count of active filters that live behind the Advanced disclosure (not the always-visible primary bar). */
export function countAdvancedFilters(filters: FilterState): number {
  return FILTER_DESCRIPTORS.filter((d) => d.advanced && d.isActive(filters)).length;
}
