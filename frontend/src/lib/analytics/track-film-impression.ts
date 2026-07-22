import { hasAnalyticsConsent } from "./cookie-consent";
import { hasRecordedImpression, recordImpression } from "./impression-store";
import { trackEvent } from "./track-event";

export function trackFilmImpression(
  filmId: string,
  context?: Record<string, unknown>,
): void {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return;

  try {
    if (hasRecordedImpression(filmId)) return;
    recordImpression(filmId);
    trackEvent({
      type: "impression",
      filmId,
      context: { source: "film_card", ...context },
    });
  } catch {
    // Analytics must never block the product experience.
  }
}
