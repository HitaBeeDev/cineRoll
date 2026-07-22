import { trackEvent } from "@/lib/analytics";
import { createApiError } from "./api-error";
import { JSON_HEADERS } from "./constants";
import type { FilmStatus } from "./watched-types";

type Sentiment = "like" | "dislike" | null;

export async function markFilmWatched(
  filmId: string,
  doNotSuggest: boolean,
  sentiment?: Sentiment,
): Promise<void> {
  const response = await fetch("/api/user/watched", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(createWatchedBody(filmId, doNotSuggest, sentiment)),
  });
  if (!response.ok) throw await createApiError(response, "Failed to save");
  if (sentiment) trackSentiment(filmId, sentiment);
}

export async function removeFilmWatched(filmId: string): Promise<void> {
  const response = await fetch("/api/user/watched", {
    method: "DELETE",
    headers: JSON_HEADERS,
    body: JSON.stringify({ filmId }),
  });
  if (!response.ok && response.status !== 204) {
    throw await createApiError(response, "Failed to remove");
  }
}

export async function fetchFilmStatus(filmId: string): Promise<FilmStatus> {
  const response = await fetch(
    `/api/user/film-status/${encodeURIComponent(filmId)}`,
  );
  if (!response.ok) throw await createApiError(response, "Failed to load film status");
  return response.json() as Promise<FilmStatus>;
}

function createWatchedBody(
  filmId: string,
  doNotSuggest: boolean,
  sentiment?: Sentiment,
): { filmId: string; doNotSuggest: boolean; sentiment?: Sentiment } {
  return sentiment === undefined
    ? { filmId, doNotSuggest }
    : { filmId, doNotSuggest, sentiment };
}

function trackSentiment(filmId: string, sentiment: Exclude<Sentiment, null>): void {
  trackEvent({
    type: "sentiment_set",
    filmId,
    context: { source: "watched_api", sentiment },
  });
}
