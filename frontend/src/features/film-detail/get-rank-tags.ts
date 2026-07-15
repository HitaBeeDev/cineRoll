import type { Film } from "@cineroll/types";

export function getRankTags(film: Film): string[] {
  return [
    film.imdbTopMovieRank !== null
      ? `IMDb Top 250 #${film.imdbTopMovieRank}`
      : null,
    film.imdbTopTvRank !== null
      ? `IMDb Top TV #${film.imdbTopTvRank}`
      : null,
  ].filter((tag): tag is string => tag !== null);
}
