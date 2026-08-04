import { PERSONALIZED_ROLL_KEY } from "@/features/home/constants/personalized-roll-key";

export function writePersonalizedRollPreference(enabled: boolean): void {
  try {
    window.localStorage.setItem(PERSONALIZED_ROLL_KEY, enabled ? "1" : "0");
  } catch {
    // The in-memory preference remains usable when storage is blocked.
  }
}
