import type { FilterState } from "@cineroll/types";
import { nameToSlug } from "@/lib/utils";
import { DECADE_MAX, DECADE_MIN, awardBodyName } from "@/components/filter-bar/constants";

export type ActiveFilterChip = {
  key: string;
  label: string;
  href?: string;
  onRemove: () => void;
};

const CONTENT_TYPE_LABELS: Record<string, string> = {
  movie: "Movie",
  short: "Short",
  animation: "Animation",
  documentary: "Documentary",
  "tv-series": "TV Series",
  "tv-mini-series": "TV Mini-Series",
};

/** Build the ordered list of removable chips for every non-default filter. */
export function getActiveFilterChips(
  filters: FilterState,
  onFiltersChange: (updates: Partial<FilterState>) => void,
): ActiveFilterChip[] {
  const chips: ActiveFilterChip[] = [];

  if (filters.search.trim()) {
    chips.push({
      key: "search",
      label: `Title: ${filters.search.trim()}`,
      onRemove: () => onFiltersChange({ search: "", page: 1 }),
    });
  }

  if (filters.person.trim()) {
    chips.push({
      key: "person",
      label: `Person: ${filters.person.trim()}`,
      href: `/person/${nameToSlug(filters.person.trim())}`,
      onRemove: () => onFiltersChange({ person: "", page: 1 }),
    });
  }

  if (filters.femaleDirectorOnly) {
    chips.push({
      key: "femaleDirectorOnly",
      label: "Female director",
      onRemove: () => onFiltersChange({ femaleDirectorOnly: false, page: 1 }),
    });
  }

  for (const body of filters.awardBodies) {
    chips.push({
      key: `awardBody:${body}`,
      label: awardBodyName(body),
      onRemove: () =>
        onFiltersChange({ awardBodies: filters.awardBodies.filter((b) => b !== body), page: 1 }),
    });
  }

  if (filters.winnerOnly) {
    chips.push({
      key: "winnerOnly",
      label: "Won",
      onRemove: () =>
        onFiltersChange({ winnerOnly: false, nominatedOnly: false, page: 1 }),
    });
  } else if (filters.nominatedOnly) {
    chips.push({
      key: "nominatedOnly",
      label: "Nominated",
      onRemove: () => onFiltersChange({ nominatedOnly: false, page: 1 }),
    });
  }

  for (const category of filters.categories) {
    chips.push({
      key: `category:${category}`,
      label: category,
      onRemove: () =>
        onFiltersChange({ categories: filters.categories.filter((c) => c !== category), page: 1 }),
    });
  }

  if (filters.awardYear != null) {
    chips.push({
      key: "awardYear",
      label: `Year: ${filters.awardYear}`,
      onRemove: () => onFiltersChange({ awardYear: null, page: 1 }),
    });
  }

  for (const genre of filters.genres) {
    chips.push({
      key: `genre:${genre}`,
      label: genre,
      onRemove: () =>
        onFiltersChange({ genres: filters.genres.filter((g) => g !== genre), page: 1 }),
    });
  }

  if (filters.runtimeMax != null) {
    chips.push({
      key: "runtimeMax",
      label: `Under ${filters.runtimeMax + 1} min`,
      onRemove: () => onFiltersChange({ runtimeMax: null, page: 1 }),
    });
  }

  if (filters.decadeMin !== DECADE_MIN || filters.decadeMax !== DECADE_MAX) {
    chips.push({
      key: "decade",
      label: `${filters.decadeMin}–${filters.decadeMax}`,
      onRemove: () =>
        onFiltersChange({ decadeMin: DECADE_MIN, decadeMax: DECADE_MAX, page: 1 }),
    });
  }

  if (filters.nominationCount != null) {
    chips.push({
      key: "nominationCount",
      label: `${filters.nominationCount} nomination${filters.nominationCount === 1 ? "" : "s"}`,
      onRemove: () => onFiltersChange({ nominationCount: null, page: 1 }),
    });
  }

  for (const type of filters.contentTypes) {
    chips.push({
      key: `contentType:${type}`,
      label: CONTENT_TYPE_LABELS[type] ?? type,
      onRemove: () =>
        onFiltersChange({ contentTypes: filters.contentTypes.filter((t) => t !== type), page: 1 }),
    });
  }

  if (filters.imdbTopMoviesOnly) {
    chips.push({
      key: "imdbTopMovies",
      label: "IMDb Top 250 Movies",
      onRemove: () => onFiltersChange({ imdbTopMoviesOnly: false, page: 1 }),
    });
  }

  if (filters.imdbTopTvOnly) {
    chips.push({
      key: "imdbTopTv",
      label: "IMDb Top 250 Shows",
      onRemove: () => onFiltersChange({ imdbTopTvOnly: false, page: 1 }),
    });
  }

  if (filters.imdbRatingMin > 0) {
    chips.push({
      key: "imdb",
      label: `IMDb ${filters.imdbRatingMin}+`,
      onRemove: () => onFiltersChange({ imdbRatingMin: 0, page: 1 }),
    });
  }

  if (filters.rtScoreMin > 0) {
    chips.push({
      key: "rt",
      label: `RT ${filters.rtScoreMin}%+`,
      onRemove: () => onFiltersChange({ rtScoreMin: 0, page: 1 }),
    });
  }

  return chips;
}
