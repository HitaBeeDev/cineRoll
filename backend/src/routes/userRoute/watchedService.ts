import { logEvent } from "../../lib/events";
import { HttpError } from "../../middleware/errorHandler";
import { assertFilmExists } from "./filmRepository";
import { mapEntryFilm, paginatedFilmEntries } from "./filmMapper";
import { staleTasteProfile } from "./taste";
import {
  deleteWatchedFilm,
  findWatchedPage,
  upsertWatchedFilm,
} from "./watchedRepository";

export async function listWatched(userId: string, limit: number, cursor?: string) {
  const entries = await findWatchedPage(userId, limit, cursor);
  const { page, nextCursor } = paginatedFilmEntries(entries, limit);

  return {
    watched: page.map(mapEntryFilm),
    nextCursor,
  };
}

export async function setWatchedFilm(
  userId: string,
  filmId: string,
  doNotSuggest: boolean,
  sentiment: "like" | "dislike" | null | undefined,
) {
  await assertFilmExists(filmId);

  const entry = await upsertWatchedFilm(userId, filmId, doNotSuggest, sentiment);
  await logWatchedEvent(userId, filmId, doNotSuggest, sentiment);
  if (sentiment !== undefined) await logSentimentEvent(userId, filmId, sentiment);
  await staleTasteProfile(userId);

  return mapEntryFilm(entry);
}

export async function removeWatchedFilm(userId: string, filmId: string): Promise<void> {
  if (!(await deleteWatchedFilm(userId, filmId))) {
    throw new HttpError(404, "Watched entry not found", "WATCHED_ENTRY_NOT_FOUND");
  }

  await logEvent({
    type: "watched",
    userId,
    filmId,
    context: { source: "user_route", action: "remove" },
  });
  await staleTasteProfile(userId);
}

function logWatchedEvent(
  userId: string,
  filmId: string,
  doNotSuggest: boolean,
  sentiment: "like" | "dislike" | null | undefined,
) {
  return logEvent({
    type: doNotSuggest ? "not_interested" : "watched",
    userId,
    filmId,
    context: {
      source: "user_route",
      doNotSuggest,
      sentiment: sentiment ?? null,
    },
  });
}

function logSentimentEvent(
  userId: string,
  filmId: string,
  sentiment: "like" | "dislike" | null,
) {
  return logEvent({
    type: "sentiment_set",
    userId,
    filmId,
    context: { sentiment },
  });
}
