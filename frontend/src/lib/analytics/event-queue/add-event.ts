import type { QueuedEvent } from "../types";
import { events } from "./events";

export function addEvent(event: QueuedEvent): void {
  events.queued.push(event);
}
