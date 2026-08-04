import { getEventCount } from "@/lib/analytics/event-queue/get-event-count";
import { restoreEventBatch } from "@/lib/analytics/event-queue/restore-event-batch";
import { takeEventBatch } from "@/lib/analytics/event-queue/take-event-batch";
import { sendEventBatch } from "@/lib/analytics/event-transport/send-event-batch";
import { sendEventBatchWithBeacon } from "@/lib/analytics/event-transport/send-event-batch-with-beacon";
import { scheduleEventFlush } from "./schedule-event-flush";

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
