import { hasAnalyticsConsent } from "@/lib/analytics/cookie-consent/has-analytics-consent";
import { hasRecordedImpression } from "@/lib/analytics/impression-store/has-recorded-impression";
import { recordImpression } from "@/lib/analytics/impression-store/record-impression";
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
