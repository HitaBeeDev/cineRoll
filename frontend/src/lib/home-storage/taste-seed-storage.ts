import type { TasteSeed } from "./onboarding-storage-types";
import { TASTE_SEED_STORAGE_KEY } from "./taste-seed-constants";

export function saveTasteSeed(seed: TasteSeed | null): void {
  if (!seed) return;

  try {
    window.localStorage.setItem(TASTE_SEED_STORAGE_KEY, JSON.stringify(seed));
  } catch {
    // Storage must never prevent onboarding completion.
  }
}
