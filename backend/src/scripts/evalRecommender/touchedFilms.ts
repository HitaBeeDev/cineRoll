import type { WatchedRow, WatchlistRow } from "./types";

export function touchedFilmIds(
  watched: WatchedRow[],
  watchlist: WatchlistRow[],
  heldOutIds: Set<string>,
): string[] {
  return [
    ...new Set([
      ...watched.map(entry => entry.filmId),
      ...watchlist.map(entry => entry.filmId),
    ]),
  ].filter(id => !heldOutIds.has(id));
}
