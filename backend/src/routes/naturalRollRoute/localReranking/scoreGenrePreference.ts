import type { RandomFilmRow } from "../../random";
import { LOCAL_RERANK_WEIGHTS } from "./weights";

export const scoreGenrePreference = (
  film: RandomFilmRow,
  requestedGenres: string[],
  missingPenalty: number,
): number => {
  const filmGenres = new Set(film.genres.map(genre => genre.toLowerCase()));

  return requestedGenres.reduce((score, requestedGenre) => {
    const matches = filmGenres.has(requestedGenre.toLowerCase());

    return score + (matches ? LOCAL_RERANK_WEIGHTS.genreMatch : missingPenalty);
  }, 0);
};
