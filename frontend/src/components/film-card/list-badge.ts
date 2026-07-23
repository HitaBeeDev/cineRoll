import type { Film } from "@cineroll/types";

/** IMDb Top 250 list badge (film or TV), or null when the film is unranked. */
export function getListBadge(film: Film) {
  if (film.imdbTopMovieRank != null) {
    return { label: "IMDb Top 250 Film", detail: `#${film.imdbTopMovieRank}` };
  }
  if (film.imdbTopTvRank != null) {
    return { label: "IMDb Top 250 TV", detail: `#${film.imdbTopTvRank}` };
  }
  return null;
}
