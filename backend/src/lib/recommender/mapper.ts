import { TasteProfileVectors } from "../tasteProfile";
import { buildReason } from "./reasonBuilder";
import { Recommendation, Scored } from "./types";

export function toRecommendation(
  scored: Scored,
  taste: TasteProfileVectors,
  likedByGenre: Map<string, string>,
  coldStart: boolean,
  index: number,
): Recommendation {
  const { film, score } = scored;

  return {
    id: film.id,
    slug: film.slug,
    title: film.title,
    year: film.releaseYear,
    posterUrl: film.posterUrl,
    genres: film.genres,
    director: film.director,
    imdbRating: film.imdbRating,
    rtScore: film.rtScore,
    score: Math.round(score * 1000) / 1000,
    reason: buildReason(film, taste, likedByGenre, coldStart, index),
  };
}
