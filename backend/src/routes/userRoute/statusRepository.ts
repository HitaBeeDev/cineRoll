import { prisma } from "../../lib/prisma";
import { getTasteProfile } from "../../lib/tasteProfile";
import { TASTE_PROFILE_CONFIG } from "../../lib/tasteProfile/constants";
import { Vector } from "../../lib/tasteProfile/types";

// How many favorite genres to surface on the profile stats row.
const FAVORITE_GENRE_COUNT = 3;

export async function getUserSummary(userId: string) {
  const [watchlist, watched, hidden] = await Promise.all([
    prisma.watchlist.count({ where: { userId } }),
    prisma.watchedFilm.count({ where: { userId, doNotSuggest: false } }),
    prisma.watchedFilm.count({ where: { userId, doNotSuggest: true } }),
  ]);

  const { favoriteGenres, genresFromSignals } = await deriveFavoriteGenres(
    userId,
    watched,
  );

  return { watchlist, watched, hidden, favoriteGenres, genresFromSignals };
}

/**
 * Favorite genres only appear once real taste signal exists, so skip the
 * taste-profile build entirely below that bar. `watched` is an upper bound on
 * positive signals: if it can't reach the cold-start threshold, the genres
 * would be hidden anyway — and this endpoint (hit by profile, watchlist, and
 * history) stays a handful of cheap counts for new users.
 */
async function deriveFavoriteGenres(
  userId: string,
  positiveSignalCeiling: number,
): Promise<{ favoriteGenres: string[]; genresFromSignals: boolean }> {
  if (positiveSignalCeiling < TASTE_PROFILE_CONFIG.coldStartThreshold) {
    return { favoriteGenres: [], genresFromSignals: false };
  }

  const taste = await getTasteProfile(userId);
  const genresFromSignals =
    taste.positiveCount >= TASTE_PROFILE_CONFIG.coldStartThreshold;

  return {
    favoriteGenres: genresFromSignals
      ? topGenres(taste.genreWeights, FAVORITE_GENRE_COUNT)
      : [],
    genresFromSignals,
  };
}

function topGenres(weights: Vector, limit: number): string[] {
  return Object.entries(weights)
    .filter(([, weight]) => weight > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([genre]) => genre);
}

export async function getFilmStatus(userId: string, filmId: string) {
  const [watchedEntry, watchlistEntry] = await Promise.all([
    prisma.watchedFilm.findUnique({
      where: { userId_filmId: { userId, filmId } },
      select: { sentiment: true, doNotSuggest: true },
    }),
    prisma.watchlist.findUnique({
      where: { userId_filmId: { userId, filmId } },
      select: { id: true },
    }),
  ]);

  return {
    watched: watchedEntry !== null,
    sentiment: watchedEntry?.sentiment ?? null,
    doNotSuggest: watchedEntry?.doNotSuggest ?? false,
    inWatchlist: watchlistEntry !== null,
  };
}
