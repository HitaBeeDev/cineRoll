import { Prisma } from "@prisma/client";

export const candidateSelect = {
  id: true,
  slug: true,
  title: true,
  releaseYear: true,
  runtime: true,
  genres: true,
  director: true,
  posterUrl: true,
  imdbRating: true,
  rtScore: true,
  imdbTopMovieRank: true,
  imdbTopTvRank: true,
  oscarWins: true,
  oscarNominations: true,
  ggWins: true,
  ggNominations: true,
  cannesWins: true,
  cannesNominations: true,
  berlinWins: true,
  berlinNominations: true,
} satisfies Prisma.FilmSelect;
