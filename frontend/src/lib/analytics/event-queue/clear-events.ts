import { events } from "./events";

export function clearEvents(): void {
  events.queued = [];
}
