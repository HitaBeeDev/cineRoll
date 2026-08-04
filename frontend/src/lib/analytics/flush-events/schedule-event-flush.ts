import { FLUSH_INTERVAL_MS } from "@/lib/analytics/constants/flush-interval-ms";
import { flushEvents } from "@/lib/analytics/flush-events/flush-events";
import { flushTimer } from "./flush-timer";

export function scheduleEventFlush(): void {
  if (flushTimer.id !== null) return;

  flushTimer.id = window.setTimeout(() => {
    flushTimer.id = null;
    void flushEvents();
  }, FLUSH_INTERVAL_MS);
}
