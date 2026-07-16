import { Prisma } from "@prisma/client";

export const pickOfDaySelect = {
  id: true,
  slug: true,
  title: true,
  originalTitle: true,
  releaseYear: true,
  runtime: true,
  genres: true,
  contentType: true,
  tvSeasons: true,
  tvEpisodes: true,
  plot: true,
  director: true,
  posterUrl: true,
  posterColor: true,
  backdropUrl: true,
  imdbRating: true,
  rtScore: true,
  oscarNominations: true,
  oscarWins: true,
  ggNominations: true,
  ggWins: true,
  cannesNominations: true,
  cannesWins: true,
} satisfies Prisma.FilmSelect;

export const POOL_COLUMNS = Prisma.raw(`
  f."id", f."slug", f."title", f."originalTitle",
  f."year" AS "releaseYear",
  f."runtime", f."genres", f."contentType", f."tvSeasons", f."tvEpisodes", f."plot", f."director",
  f."posterUrl", f."posterColor", f."backdropUrl",
  f."imdbRating", f."rtScore",
  f."oscarNominations", f."oscarWins",
  f."ggNominations", f."ggWins",
  f."cannesNominations", f."cannesWins"
`);
