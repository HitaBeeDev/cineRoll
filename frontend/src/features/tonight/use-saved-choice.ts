import { useMemo, useSyncExternalStore } from "react";
import { loadChoice } from "./load-choice";
import type { SavedChoice } from "./saved-choice-type";
import { TONIGHT_STORAGE_KEY } from "./tonight-storage-key";

// Saved once per pick; nothing else writes it while the page is open.
const subscribe = () => () => {};
// The raw string is the snapshot: stable between renders, unlike a parsed object.
const getSnapshot = () => {
  try {
    return window.localStorage.getItem(TONIGHT_STORAGE_KEY);
  } catch {
    return null;
  }
};
const getServerSnapshot = () => null;

/** The country and services this viewer picked last time, or null (and always null on the server). */
export function useSavedChoice(): SavedChoice | null {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useMemo(() => loadChoice(raw), [raw]);
}
