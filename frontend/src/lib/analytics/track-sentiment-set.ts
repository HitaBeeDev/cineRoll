import { trackEvent } from "./track-event";

export function trackSentimentSet(
  filmId: string,
  sentiment: string,
  context?: Record<string, unknown>,
): void {
  trackEvent({
    type: "sentiment_set",
    filmId,
    context: { sentiment, ...context },
  });
}
