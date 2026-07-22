import type { RerollPenalty, RollFilm } from "@/lib/api";
import {
  applyFilmRerollPenalty,
  createEmptyRerollPenalty,
  decayRerollPenalty,
  sanitizeRerollPenalty,
} from "./reroll-penalty-calculator";
import { REROLL_PENALTY_STORAGE_KEY } from "./reroll-penalty-constants";

export function getRerollPenalty(): RerollPenalty {
  try {
    const raw = window.sessionStorage.getItem(REROLL_PENALTY_STORAGE_KEY);
    return sanitizeRerollPenalty(raw ? JSON.parse(raw) : null);
  } catch {
    return createEmptyRerollPenalty();
  }
}

export function decayRerollPenalties(): void {
  writeRerollPenalty(decayRerollPenalty(getRerollPenalty()));
}

export function addRerollPenalty(
  film: RollFilm,
  strength: "weak" | "strong",
): void {
  const penalty = applyFilmRerollPenalty(
    getRerollPenalty(),
    film,
    strength,
  );
  writeRerollPenalty(penalty);
}

export function resetRerollPenalty(): void {
  try {
    window.sessionStorage.removeItem(REROLL_PENALTY_STORAGE_KEY);
  } catch {
    // Reroll learning is optional.
  }
}

function writeRerollPenalty(penalty: RerollPenalty): void {
  try {
    window.sessionStorage.setItem(
      REROLL_PENALTY_STORAGE_KEY,
      JSON.stringify(penalty),
    );
  } catch {
    // Reroll learning must never interrupt rolling.
  }
}
