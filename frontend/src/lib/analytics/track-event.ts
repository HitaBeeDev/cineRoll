import { getClientIdentifiers } from "./client-identifiers";
import { MAX_BATCH_SIZE } from "@/lib/analytics/constants/max-batch-size";
import { hasAnalyticsConsent } from "@/lib/analytics/cookie-consent/has-analytics-consent";
import { addEvent } from "@/lib/analytics/event-queue/add-event";
import { getEventCount } from "@/lib/analytics/event-queue/get-event-count";
import { flushEvents } from "@/lib/analytics/flush-events/flush-events";
import { scheduleEventFlush } from "@/lib/analytics/flush-events/schedule-event-flush";
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
