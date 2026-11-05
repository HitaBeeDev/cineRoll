import { useSyncExternalStore } from "react";
import { pickViewerRegion } from "./pick-viewer-region";

// Browser languages don't change while the page is open; nothing to subscribe to.
const subscribe = () => () => {};
const getSnapshot = () => pickViewerRegion(navigator.languages ?? [navigator.language]);
const getServerSnapshot = () => null;

/** The viewer's country from their browser, or null on the server / when unknown. */
export function useViewerRegion(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
