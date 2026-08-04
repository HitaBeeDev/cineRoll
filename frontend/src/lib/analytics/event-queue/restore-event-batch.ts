import { MAX_BATCH_SIZE } from "@/lib/analytics/constants/max-batch-size";
import type { QueuedEvent } from "../types";
import { events } from "./events";

export function restoreEventBatch(batch: QueuedEvent[]): void {
  events.queued = [...batch, ...events.queued].slice(0, MAX_BATCH_SIZE);
}
