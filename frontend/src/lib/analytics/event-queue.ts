import { MAX_BATCH_SIZE } from "./constants";
import type { QueuedEvent } from "./types";

let events: QueuedEvent[] = [];

export function addEvent(event: QueuedEvent): void {
  events.push(event);
}

export function clearEvents(): void {
  events = [];
}

export function getEventCount(): number {
  return events.length;
}

export function takeEventBatch(): QueuedEvent[] {
  return events.splice(0, MAX_BATCH_SIZE);
}

export function restoreEventBatch(batch: QueuedEvent[]): void {
  events = [...batch, ...events].slice(0, MAX_BATCH_SIZE);
}
