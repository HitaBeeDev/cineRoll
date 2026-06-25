import { prisma } from "../prisma";
import { filmFeatureSelect } from "./filmFeatures";

export async function loadTasteSignalRows(userId: string) {
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
      select: { addedAt: true, film: { select: filmFeatureSelect } },
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
    prisma.user.findUnique({
      where: { id: userId },
      select: { onboardingGenres: true },
    }),
  ]);

  return {
    onboardingGenres: user?.onboardingGenres ?? [],
    ratings,
    watched,
    watchlist,
  };
}

export type TasteSignalRows = Awaited<ReturnType<typeof loadTasteSignalRows>>;
