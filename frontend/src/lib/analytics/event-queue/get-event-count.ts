import { events } from "./events";

export function getEventCount(): number {
  return events.queued.length;
}
