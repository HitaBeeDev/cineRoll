import { FLUSH_INTERVAL_MS } from "./constants";
import {
  getEventCount,
  restoreEventBatch,
  takeEventBatch,
} from "./event-queue";
import { sendEventBatch, sendEventBatchWithBeacon } from "./event-transport";

let flushTimer: number | null = null;

export function scheduleEventFlush(): void {
  if (flushTimer !== null) return;

  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    void flushEvents();
  }, FLUSH_INTERVAL_MS);
}

export async function flushEvents(useBeacon = false): Promise<void> {
  if (typeof window === "undefined" || getEventCount() === 0) return;

  while (getEventCount() > 0) {
    const batch = takeEventBatch();

    try {
      if (useBeacon && sendEventBatchWithBeacon(batch)) continue;
      await sendEventBatch(batch);
    } catch {
      restoreEventBatch(batch);
      scheduleEventFlush();
      return;
    }
  }
}
