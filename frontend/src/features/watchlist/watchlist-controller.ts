import type { WatchlistEntry, WatchlistFilm } from "./domain-types";

export type WatchlistController = {
  entries: WatchlistEntry[];
  hasMore: boolean;
  isLoadingMore: boolean;
  removingFilmIds: Set<string>;
  loadMore: () => Promise<void>;
  removeFilm: (film: WatchlistFilm) => Promise<void>;
};
