import type { QueuedEvent } from "../types";
import { EVENTS_ENDPOINT } from "./events-endpoint";

export async function sendEventBatch(events: QueuedEvent[]): Promise<void> {
  await fetch(EVENTS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(events),
    keepalive: true,
  });
}
