import type { WatchedEntry, WatchedFilm } from "./domain-types";

export type HistoryGridController = {
  busyFilmIds: Set<string>;
  entries: WatchedEntry[];
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  rateFilm: (
    film: WatchedFilm,
    sentiment: "like" | "dislike",
  ) => Promise<void>;
  removeFilm: (film: WatchedFilm) => Promise<void>;
};
