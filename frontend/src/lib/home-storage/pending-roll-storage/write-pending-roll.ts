import { PENDING_ROLL_STORAGE_KEY } from "@/lib/home-storage/pending-roll-constants/pending-roll-storage-key";
import type { PendingRoll } from "@/lib/home-storage/pending-roll-types";

export function writePendingRoll(roll: PendingRoll): void {
  try {
    window.sessionStorage.setItem(PENDING_ROLL_STORAGE_KEY, JSON.stringify(roll));
  } catch {
    // Grading the previous draw is a refinement; rolling must work without it.
  }
}
