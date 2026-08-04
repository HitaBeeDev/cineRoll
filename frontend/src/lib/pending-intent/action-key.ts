/**
 * Persists a single pending user action across the sign-in round-trip.
 *
 * Email auth is a magic link — the user fully leaves the page — so the intent
 * can't live in memory. We stash it in localStorage keyed by film, then replay
 * it once the user lands back authenticated (Google redirect or magic link,
 * same browser). Cross-device magic-link opens are a deliberately accepted
 * loss: the worst case is the user simply re-does the action.
 */

export const ACTION_KEY = (filmId: string) => `cineroll.pending.action.${filmId}`;
