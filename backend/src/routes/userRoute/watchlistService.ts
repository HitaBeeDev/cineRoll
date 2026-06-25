import { logEvent } from "../../lib/events";
import { HttpError } from "../../middleware/errorHandler";
import { isUniqueConstraintError } from "./errors";
import { assertFilmExists } from "./filmRepository";
import { mapEntryFilm, paginatedFilmEntries } from "./filmMapper";
import { staleTasteProfile } from "./taste";
import {
  createWatchlistEntry,
  deleteWatchlistEntry,
  findWatchlistPage,
} from "./watchlistRepository";

export async function listWatchlist(userId: string, limit: number, cursor?: string) {
  const entries = await findWatchlistPage(userId, limit, cursor);
  const { page, nextCursor } = paginatedFilmEntries(entries, limit);

  return {
    watchlist: page.map(mapEntryFilm),
    nextCursor,
  };
}

export async function addWatchlistFilm(userId: string, filmId: string) {
  await assertFilmExists(filmId);

  try {
    const entry = await createWatchlistEntry(userId, filmId);
    await logWatchlistEvent("watchlist_add", userId, filmId);
    await staleTasteProfile(userId);

    return mapEntryFilm(entry);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new HttpError(409, "Film is already in watchlist", "WATCHLIST_ALREADY_EXISTS");
    }
    throw error;
  }
}

export async function removeWatchlistFilm(userId: string, filmId: string): Promise<void> {
  if (!(await deleteWatchlistEntry(userId, filmId))) {
    throw new HttpError(404, "Watchlist entry not found", "WATCHLIST_ENTRY_NOT_FOUND");
  }

  await logWatchlistEvent("watchlist_remove", userId, filmId);
  await staleTasteProfile(userId);
}

function logWatchlistEvent(type: "watchlist_add" | "watchlist_remove", userId: string, filmId: string) {
  return logEvent({
    type,
    userId,
    filmId,
    context: { source: "user_route" },
  });
}
