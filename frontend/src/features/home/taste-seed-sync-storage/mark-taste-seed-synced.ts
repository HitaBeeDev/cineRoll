import { TASTE_SEED_SYNCED_KEY } from "@/features/home/constants/taste-seed-synced-key";

export function markTasteSeedSynced(userId: string): void {
  try {
    window.localStorage.setItem(TASTE_SEED_SYNCED_KEY, userId);
  } catch {
    // A later mount can retry when storage is available.
  }
}
