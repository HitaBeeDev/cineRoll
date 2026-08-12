import { PENDING_ROLL_STORAGE_KEY } from "@/lib/home-storage/pending-roll-constants/pending-roll-storage-key";

export function clearPendingRoll(): void {
  try {
    window.sessionStorage.removeItem(PENDING_ROLL_STORAGE_KEY);
  } catch {
    // Nothing to do: the record is only ever read through its guard.
  }
}
