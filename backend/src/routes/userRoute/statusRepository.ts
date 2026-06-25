import { prisma } from "../../lib/prisma";

export async function getUserSummary(userId: string) {
  const [watchlist, watched, hidden] = await Promise.all([
    prisma.watchlist.count({ where: { userId } }),
    prisma.watchedFilm.count({ where: { userId, doNotSuggest: false } }),
    prisma.watchedFilm.count({ where: { userId, doNotSuggest: true } }),
  ]);

  return { watchlist, watched, hidden };
}

export async function getFilmStatus(userId: string, filmId: string) {
  const [watchedEntry, watchlistEntry, ratingEntry] = await Promise.all([
    prisma.watchedFilm.findUnique({
      where: { userId_filmId: { userId, filmId } },
      select: { sentiment: true, doNotSuggest: true },
    }),
    prisma.watchlist.findUnique({
      where: { userId_filmId: { userId, filmId } },
      select: { id: true },
    }),
    prisma.userRating.findUnique({
      where: { userId_filmId: { userId, filmId } },
      select: { rating: true },
    }),
  ]);

  return {
    watched: watchedEntry !== null,
    sentiment: watchedEntry?.sentiment ?? null,
    doNotSuggest: watchedEntry?.doNotSuggest ?? false,
    inWatchlist: watchlistEntry !== null,
    rating: ratingEntry?.rating ?? null,
  };
}
