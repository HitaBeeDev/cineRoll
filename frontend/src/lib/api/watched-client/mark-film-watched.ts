import { trackEvent } from "@/lib/analytics";
import { createApiError } from "@/lib/api/api-error/create-api-error";
import { JSON_HEADERS } from "@/lib/api/constants/json-headers";

function trackSentiment(filmId: string, sentiment: Exclude<Sentiment, null>): void {
  trackEvent({
    type: "sentiment_set",
    filmId,
    context: { source: "watched_api", sentiment },
  });
}

type Sentiment = "like" | "dislike" | null;

function createWatchedBody(
  filmId: string,
  doNotSuggest: boolean,
  sentiment?: Sentiment,
): { filmId: string; doNotSuggest: boolean; sentiment?: Sentiment } {
  return sentiment === undefined
    ? { filmId, doNotSuggest }
    : { filmId, doNotSuggest, sentiment };
}

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
