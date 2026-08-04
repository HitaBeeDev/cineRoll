import type { RerollPenalty } from "@/lib/api";
import { REROLL_PENALTY_STORAGE_KEY } from "@/lib/home-storage/reroll-penalty-constants/reroll-penalty-storage-key";

export function writeRerollPenalty(penalty: RerollPenalty): void {
  try {
    window.sessionStorage.setItem(
      REROLL_PENALTY_STORAGE_KEY,
      JSON.stringify(penalty),
    );
  } catch {
    // Reroll learning must never interrupt rolling.
  }
}
