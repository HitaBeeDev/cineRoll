import { PERSONALIZED_ROLL_KEY } from "./constants";

export function readPersonalizedRollPreference(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(PERSONALIZED_ROLL_KEY) === "1";
  } catch {
    return false;
  }
}

export function writePersonalizedRollPreference(enabled: boolean): void {
  try {
    window.localStorage.setItem(PERSONALIZED_ROLL_KEY, enabled ? "1" : "0");
  } catch {
    // The in-memory preference remains usable when storage is blocked.
  }
}
