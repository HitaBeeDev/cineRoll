import { ACTION_KEY } from "./action-key";
import type { PendingFilmAction } from "./pending-film-action";

function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode / quota) — intent is best-effort */
  }
}

export function setPendingFilmAction(filmId: string, action: PendingFilmAction): void {
  safeSet(ACTION_KEY(filmId), action);
}
