import { getClientIdentifiers } from "./client-identifiers";
import { MAX_BATCH_SIZE } from "./constants";
import { hasAnalyticsConsent } from "./cookie-consent";
import { addEvent, getEventCount } from "./event-queue";
import { flushEvents, scheduleEventFlush } from "./flush-events";
import { bindLifecycleFlush } from "./lifecycle-flush";
import type { TrackEventInput } from "./types";

export function trackEvent(input: TrackEventInput): void {
  if (typeof window === "undefined" || !hasAnalyticsConsent()) return;

  try {
    bindLifecycleFlush();
    addEvent({
      ...getClientIdentifiers(),
      type: input.type,
      filmId: input.filmId ?? null,
      context: input.context ?? {},
      variant: input.variant ?? null,
      consent: "granted",
    });

    if (getEventCount() >= MAX_BATCH_SIZE) void flushEvents();
    else scheduleEventFlush();
  } catch {
    // Analytics must never block the product experience.
  }
}
