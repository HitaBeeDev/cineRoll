import { ACTION_KEY } from "./action-key";
import type { PendingFilmAction } from "./pending-film-action";
import { safeRemove } from "./safe-remove";

const FILM_ACTIONS: readonly PendingFilmAction[] = ["watched", "notInterested", "watchlist"];

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function takePendingFilmAction(filmId: string): PendingFilmAction | null {
  const raw = safeGet(ACTION_KEY(filmId));
  if (raw === null) return null;
  safeRemove(ACTION_KEY(filmId));
  return FILM_ACTIONS.includes(raw as PendingFilmAction) ? (raw as PendingFilmAction) : null;
}
