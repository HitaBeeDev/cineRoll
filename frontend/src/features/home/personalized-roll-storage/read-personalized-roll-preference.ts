import { PERSONALIZED_ROLL_KEY } from "@/features/home/constants/personalized-roll-key";

export function readPersonalizedRollPreference(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(PERSONALIZED_ROLL_KEY) === "1";
  } catch {
    return false;
  }
}
