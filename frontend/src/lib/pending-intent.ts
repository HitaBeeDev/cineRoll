/**
 * Persists a single pending user action across the sign-in round-trip.
 *
 * Email auth is a magic link — the user fully leaves the page — so the intent
 * can't live in memory. We stash it in localStorage keyed by film, then replay
 * it once the user lands back authenticated (Google redirect or magic link,
 * same browser). Cross-device magic-link opens are a deliberately accepted
 * loss: the worst case is the user simply re-does the action.
 */

const ACTION_KEY = (filmId: string) => `cineroll.pending.action.${filmId}`;

/** A gated film action a guest attempted before signing in. */
export type PendingFilmAction = "watched" | "notInterested" | "watchlist";

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode / quota) — intent is best-effort */
  }
}

function safeRemove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* no-op */
  }
}

const FILM_ACTIONS: readonly PendingFilmAction[] = ["watched", "notInterested", "watchlist"];

export function setPendingFilmAction(filmId: string, action: PendingFilmAction): void {
  safeSet(ACTION_KEY(filmId), action);
}

export function clearPendingFilmAction(filmId: string): void {
  safeRemove(ACTION_KEY(filmId));
}

export function takePendingFilmAction(filmId: string): PendingFilmAction | null {
  const raw = safeGet(ACTION_KEY(filmId));
  if (raw === null) return null;
  safeRemove(ACTION_KEY(filmId));
  return FILM_ACTIONS.includes(raw as PendingFilmAction) ? (raw as PendingFilmAction) : null;
}
