import type { FilterState } from "@cineroll/types";
import { DECADE_MAX, DECADE_MIN, awardBodyName } from "@/components/filter-bar/constants";

const CONTENT_RECIPE_LABELS: Record<string, string> = {
  movie: "movies",
  short: "short films",
  animation: "animations",
  documentary: "documentaries",
  "tv-series": "TV shows",
};

/** Turn the active filters into the human-readable "Rolling from: …" summary. */
export function buildRollRecipe(filters: FilterState): string {
  const parts: string[] = [];

  if (filters.imdbTopMoviesOnly) parts.push("IMDb Top 250 Movies");
  if (filters.imdbTopTvOnly) parts.push("IMDb Top 250 Shows");

  const bodyLabel = filters.awardBodies.length > 0
    ? filters.awardBodies.map(awardBodyName).join(" & ")
    : null;
  if (bodyLabel !== null) {
    if (filters.winnerOnly) parts.push(`${bodyLabel} winners`);
    else if (filters.nominatedOnly) parts.push(`${bodyLabel} nominations`);
    else parts.push(`${bodyLabel} films`);
  } else if (!filters.imdbTopMoviesOnly && !filters.imdbTopTvOnly) {
    if (filters.winnerOnly) parts.push("winners");
    else if (filters.nominatedOnly) parts.push("nominated films");
  }

  const contentLabel = filters.contentTypes.map((t) => CONTENT_RECIPE_LABELS[t] ?? t).join(" & ");
  if (contentLabel) parts.push(contentLabel);

  if (filters.genres.length > 0) parts.push(filters.genres.join(" & "));
  if (filters.categories.length > 0) parts.push(filters.categories.join(" & "));

  const minSet = filters.decadeMin !== DECADE_MIN;
  const maxSet = filters.decadeMax !== DECADE_MAX;
  if (minSet && maxSet) parts.push(`${filters.decadeMin}s–${filters.decadeMax}s`);
  else if (minSet) parts.push(`${filters.decadeMin}s onwards`);
  else if (maxSet) parts.push(`up to ${filters.decadeMax}s`);

  if (filters.awardYear != null) parts.push(`${filters.awardYear} ceremony`);
  if (filters.nominationCount != null) parts.push(`${filters.nominationCount}+ nominations`);
  if (filters.person.trim()) parts.push(filters.person.trim());
  if (filters.femaleDirectorOnly) parts.push("female-directed");
  if (filters.search.trim()) parts.push(`"${filters.search.trim()}"`);
  if (filters.imdbRatingMin > 0) parts.push(`IMDb ${filters.imdbRatingMin}+`);
  if (filters.rtScoreMin > 0) parts.push(`RT ${filters.rtScoreMin}%+`);

  if (filters.runtimeMax != null) {
    const runtimeLabel =
      filters.runtimeMax === 89 ? "Quick Watch" :
      filters.runtimeMax === 119 ? "Standard" :
      filters.runtimeMax === 149 ? "Long Haul" :
      `under ${filters.runtimeMax + 1} min`;
    parts.push(runtimeLabel);
  }

  return parts.join(" · ");
}
