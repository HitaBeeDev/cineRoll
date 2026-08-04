import { MAX_BATCH_SIZE } from "@/lib/analytics/constants/max-batch-size";
import type { QueuedEvent } from "../types";
import { events } from "./events";

export function takeEventBatch(): QueuedEvent[] {
  return events.queued.splice(0, MAX_BATCH_SIZE);
}
