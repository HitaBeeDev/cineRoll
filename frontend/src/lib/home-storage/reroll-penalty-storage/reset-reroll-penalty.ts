import { REROLL_PENALTY_STORAGE_KEY } from "@/lib/home-storage/reroll-penalty-constants/reroll-penalty-storage-key";

export function resetRerollPenalty(): void {
  try {
    window.sessionStorage.removeItem(REROLL_PENALTY_STORAGE_KEY);
  } catch {
    // Reroll learning is optional.
  }
}
