import { Prisma } from "@prisma/client";

import { prisma } from "../prisma";
import { TasteProfileVectors } from "../tasteProfile";
import { RECOMMENDER_LIMITS } from "./constants";
import { candidateSelect } from "./select";
import { CandidateFilm } from "./types";

export async function generateCandidates(
  userId: string,
  taste: TasteProfileVectors,
): Promise<CandidateFilm[]> {
  return generateCandidatePool(await getExcludedFilmIds(userId), taste);
}

export async function generateCandidatePool(
  excludedIds: string[],
  taste: TasteProfileVectors,
): Promise<CandidateFilm[]> {
  return prisma.film.findMany({
    where: candidateWhere(excludedIds, taste),
    select: candidateSelect,
    orderBy: [{ imdbRating: { sort: "desc", nulls: "last" } }],
    take: RECOMMENDER_LIMITS.poolSize,
  });
}

async function getExcludedFilmIds(userId: string): Promise<string[]> {
  const [watched, watchlist] = await Promise.all([
    prisma.watchedFilm.findMany({ where: { userId }, select: { filmId: true } }),
    prisma.watchlist.findMany({ where: { userId }, select: { filmId: true } }),
  ]);

  return [
    ...new Set([
      ...watched.map(watchedFilm => watchedFilm.filmId),
      ...watchlist.map(watchlistFilm => watchlistFilm.filmId),
    ]),
  ];
}

function candidateWhere(
  excludedIds: string[],
  taste: TasteProfileVectors,
): Prisma.FilmWhereInput {
  const genres = topGenres(taste);

  return {
    ...(excludedIds.length > 0 ? { id: { notIn: excludedIds } } : {}),
    ...(genres.length > 0 ? { genres: { hasSome: genres } } : {}),
  };
}

function topGenres(taste: TasteProfileVectors): string[] {
  return Object.entries(taste.genreWeights)
    .filter(([, weight]) => weight > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, RECOMMENDER_LIMITS.topGenres)
    .map(([genre]) => genre);
}
