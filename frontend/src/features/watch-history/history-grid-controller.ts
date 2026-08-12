import type { FilmSentiment } from "@/lib/api/sentiment";
import type { WatchedEntry, WatchedFilm } from "./domain-types";

export type HistoryGridController = {
  busyFilmIds: Set<string>;
  entries: WatchedEntry[];
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  rateFilm: (
    film: WatchedFilm,
    sentiment: FilmSentiment,
  ) => Promise<void>;
  removeFilm: (film: WatchedFilm) => Promise<void>;
};
