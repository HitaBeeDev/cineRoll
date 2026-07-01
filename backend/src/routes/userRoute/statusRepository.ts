import { prisma } from "../../lib/prisma";
import { getTasteProfile } from "../../lib/tasteProfile";
import { TASTE_PROFILE_CONFIG } from "../../lib/tasteProfile/constants";
import { Vector } from "../../lib/tasteProfile/types";

// How many favorite genres to surface on the profile stats row.
const FAVORITE_GENRE_COUNT = 3;

export async function getUserSummary(userId: string) {
  const [watchlist, watched, hidden, rated, taste] = await Promise.all([
    prisma.watchlist.count({ where: { userId } }),
    prisma.watchedFilm.count({ where: { userId, doNotSuggest: false } }),
    prisma.watchedFilm.count({ where: { userId, doNotSuggest: true } }),
    prisma.userRating.count({ where: { userId } }),
    getTasteProfile(userId),
  ]);

  // Only report favorite genres once real signals exist — before that the
  // taste vector is just onboarding seeds, so the profile shows "not enough
  // data yet" instead of implying we've learned the user's taste.
  const favoriteGenres =
    taste.positiveCount >= TASTE_PROFILE_CONFIG.coldStartThreshold
      ? topGenres(taste.genreWeights, FAVORITE_GENRE_COUNT)
      : [];

  return { watchlist, watched, hidden, rated, favoriteGenres };
}

function topGenres(weights: Vector, limit: number): string[] {
  return Object.entries(weights)
    .filter(([, weight]) => weight > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([genre]) => genre);
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
