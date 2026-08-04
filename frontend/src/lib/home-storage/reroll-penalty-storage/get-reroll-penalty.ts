import type { RerollPenalty } from "@/lib/api";
import { createEmptyRerollPenalty } from "@/lib/home-storage/reroll-penalty-calculator/create-empty-reroll-penalty";
import { sanitizeRerollPenalty } from "@/lib/home-storage/reroll-penalty-calculator/sanitize-reroll-penalty";
import { REROLL_PENALTY_STORAGE_KEY } from "@/lib/home-storage/reroll-penalty-constants/reroll-penalty-storage-key";

export function getRerollPenalty(): RerollPenalty {
  try {
    const raw = window.sessionStorage.getItem(REROLL_PENALTY_STORAGE_KEY);
    return sanitizeRerollPenalty(raw ? JSON.parse(raw) : null);
  } catch {
    return createEmptyRerollPenalty();
  }
}
