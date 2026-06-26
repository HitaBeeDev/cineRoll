/**
 * Persists a single pending user action across the sign-in round-trip.
 *
 * Email auth is a magic link — the user fully leaves the page — so the intent
 * can't live in memory. We stash it in localStorage keyed by film, then replay
 * it once the user lands back authenticated (Google redirect or magic link,
 * same browser). Cross-device magic-link opens are a deliberately accepted
 * loss: the worst case is the user simply re-does the action.
 */

const RATING_KEY = (filmId: string) => `cineroll.pending.rating.${filmId}`;
const COMMENT_KEY = (slug: string) => `cineroll.pending.comment.${slug}`;

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

export function setPendingRating(filmId: string, value: number): void {
  safeSet(RATING_KEY(filmId), String(value));
}

export function takePendingRating(filmId: string): number | null {
  const raw = safeGet(RATING_KEY(filmId));
  if (raw === null) return null;
  safeRemove(RATING_KEY(filmId));
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function setPendingComment(slug: string, body: string): void {
  safeSet(COMMENT_KEY(slug), body);
}

export function takePendingComment(slug: string): string | null {
  const raw = safeGet(COMMENT_KEY(slug));
  if (raw === null) return null;
  safeRemove(COMMENT_KEY(slug));
  return raw;
}
