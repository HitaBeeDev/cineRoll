import type { QueuedEvent } from "../types";
import { EVENTS_ENDPOINT } from "./events-endpoint";

export function sendEventBatchWithBeacon(events: QueuedEvent[]): boolean {
  if (!("sendBeacon" in navigator)) return false;

  const payload = new Blob([JSON.stringify(events)], {
    type: "application/json",
  });
  return navigator.sendBeacon(EVENTS_ENDPOINT, payload);
}
