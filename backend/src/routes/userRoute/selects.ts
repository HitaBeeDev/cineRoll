import { Prisma } from "@prisma/client";

export const filmSummarySelect = {
  id: true,
  slug: true,
  title: true,
  originalTitle: true,
  releaseYear: true,
  genres: true,
  contentType: true,
  posterUrl: true,
  posterColor: true,
  imdbRating: true,
  rtScore: true,
  imdbTopMovieRank: true,
  imdbTopTvRank: true,
  certificate: true,
  tvType: true,
  tvStartYear: true,
  tvEndYear: true,
  tvSeasons: true,
  tvEpisodes: true,
  oscarNominations: true,
  oscarWins: true,
  ggNominations: true,
  ggWins: true,
  cannesNominations: true,
  cannesWins: true,
  berlinNominations: true,
  berlinWins: true,
} satisfies Prisma.FilmSelect;

export type FilmSummary = Prisma.FilmGetPayload<{ select: typeof filmSummarySelect }>;
