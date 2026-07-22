import type { RollFilm } from "@/lib/api";
import {
  MAX_ROLL_HISTORY_ITEMS,
  ROLL_HISTORY_STORAGE_KEY,
} from "./roll-history-constants";

export function pushRollHistory(film: RollFilm): void {
  try {
    const history = readRollHistory();
    const deduplicatedHistory = history.filter((item) => item?.id !== film.id);
    const nextHistory = [film, ...deduplicatedHistory].slice(
      0,
      MAX_ROLL_HISTORY_ITEMS,
    );
    window.sessionStorage.setItem(
      ROLL_HISTORY_STORAGE_KEY,
      JSON.stringify(nextHistory),
    );
  } catch {
    // Session history must never interrupt rolling.
  }
}

function readRollHistory(): RollFilm[] {
  const raw = window.sessionStorage.getItem(ROLL_HISTORY_STORAGE_KEY) ?? "[]";
  return JSON.parse(raw) as RollFilm[];
}
