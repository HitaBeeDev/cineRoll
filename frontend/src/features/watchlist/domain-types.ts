import type { SavedFilm, SavedFilmEntry } from "@/types/saved-film";

export type WatchlistFilm = SavedFilm;
export type WatchlistEntry = SavedFilmEntry;

export type WatchlistSuccess = {
  status: "ok";
  entries: WatchlistEntry[];
  nextCursor: string | null;
  total: number | null;
};

export type WatchlistResult = WatchlistSuccess | { status: "error" };

export type WatchlistPage = {
  watchlist?: WatchlistEntry[];
  nextCursor?: string | null;
  total?: number | null;
};
