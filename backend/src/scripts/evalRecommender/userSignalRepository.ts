import { prisma } from "../../lib/prisma";
import { filmFeatureSelect } from "../../lib/tasteProfile";
import type { UserSignalRows } from "./types";

export async function getEvaluationUserIds(): Promise<string[]> {
  const users = await prisma.user.findMany({ select: { id: true } });
  return users.map(user => user.id);
}

export async function loadUserSignalRows(userId: string): Promise<UserSignalRows> {
  const [watched, watchlist, ratings, user] = await Promise.all([
    prisma.watchedFilm.findMany({
      where: { userId },
      select: {
        filmId: true,
        sentiment: true,
        doNotSuggest: true,
        watchedAt: true,
        film: { select: filmFeatureSelect },
      },
    }),
    prisma.watchlist.findMany({
      where: { userId },
      select: { filmId: true, addedAt: true, film: { select: filmFeatureSelect } },
    }),
    prisma.userRating.findMany({
      where: { userId },
      select: {
        filmId: true,
        rating: true,
        updatedAt: true,
        film: { select: filmFeatureSelect },
      },
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { onboardingGenres: true } }),
  ]);

  return {
    watched,
    watchlist,
    ratings,
    onboardingGenres: user?.onboardingGenres ?? [],
  };
}
