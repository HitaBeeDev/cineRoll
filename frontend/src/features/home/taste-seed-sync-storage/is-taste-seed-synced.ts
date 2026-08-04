import { TASTE_SEED_SYNCED_KEY } from "@/features/home/constants/taste-seed-synced-key";

export function isTasteSeedSynced(userId: string): boolean {
  try {
    return window.localStorage.getItem(TASTE_SEED_SYNCED_KEY) === userId;
  } catch {
    return false;
  }
}
