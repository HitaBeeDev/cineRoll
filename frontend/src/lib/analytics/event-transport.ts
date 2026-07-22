import type { QueuedEvent } from "./types";

const EVENTS_ENDPOINT = "/api/events";

export function sendEventBatchWithBeacon(events: QueuedEvent[]): boolean {
  if (!("sendBeacon" in navigator)) return false;

  const payload = new Blob([JSON.stringify(events)], {
    type: "application/json",
  });
  return navigator.sendBeacon(EVENTS_ENDPOINT, payload);
}

export async function sendEventBatch(events: QueuedEvent[]): Promise<void> {
  await fetch(EVENTS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(events),
    keepalive: true,
  });
}
