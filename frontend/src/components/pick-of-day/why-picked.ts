import type { PickOfDayFilm } from "@/lib/api";

/**
 * The "Why this pick" rationale copy, chosen by the strongest credential the
 * film has: Oscar wins → Oscar nominations → high IMDb → high RT → primary
 * genre → a generic curated-collection line.
 */
export function getWhyPicked(film: PickOfDayFilm): string {
  if (film.oscarWins > 0) {
    return `${film.title} earned ${film.oscarWins} Academy Award ${film.oscarWins === 1 ? "win" : "wins"}, making it a strong spotlight from the awards shelf.`;
  }

  if (film.oscarNominations > 0) {
    return `${film.title} was recognized with ${film.oscarNominations} Academy Award ${film.oscarNominations === 1 ? "nomination" : "nominations"}, so today's roll starts with proven awards pedigree.`;
  }

  if (film.imdbRating != null && film.imdbRating >= 8) {
    return `${film.title} stands out with a ${film.imdbRating.toFixed(1)} IMDb rating and a place in CineRoll's curated film pool.`;
  }

  if (film.rtScore != null && film.rtScore >= 85) {
    return `${film.title} brings strong critical reception with an ${film.rtScore}% Rotten Tomatoes score.`;
  }

  const primaryGenre = film.genres[0];
  if (primaryGenre) {
    return `${film.title} is today's ${primaryGenre.toLowerCase()} spotlight from CineRoll's curated award-film collection.`;
  }

  return `${film.title} is today's spotlight from CineRoll's curated award-film collection.`;
}
