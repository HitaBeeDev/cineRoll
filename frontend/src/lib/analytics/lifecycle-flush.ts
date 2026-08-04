import { flushEvents } from "@/lib/analytics/flush-events/flush-events";

let listenersBound = false;

export function bindLifecycleFlush(): void {
  if (listenersBound || typeof window === "undefined") return;
  listenersBound = true;

  document.addEventListener("visibilitychange", flushWhenPageIsHidden);
  window.addEventListener("pagehide", flushWithBeacon);
}

function flushWhenPageIsHidden(): void {
  if (document.visibilityState === "hidden") flushWithBeacon();
}

function flushWithBeacon(): void {
  void flushEvents(true);
}
