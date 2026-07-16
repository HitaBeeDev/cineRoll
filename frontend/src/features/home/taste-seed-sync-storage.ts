import { TASTE_SEED_SYNCED_KEY } from "./constants";

export function isTasteSeedSynced(userId: string): boolean {
  try {
    return window.localStorage.getItem(TASTE_SEED_SYNCED_KEY) === userId;
  } catch {
    return false;
  }
}

export function markTasteSeedSynced(userId: string): void {
  try {
    window.localStorage.setItem(TASTE_SEED_SYNCED_KEY, userId);
  } catch {
    // A later mount can retry when storage is available.
  }
}
