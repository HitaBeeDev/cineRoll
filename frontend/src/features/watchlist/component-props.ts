import type {
  WatchlistEntry,
  WatchlistFilm,
  WatchlistResult,
  WatchlistSuccess,
} from "./domain-types";

export type WatchlistBodyProps = {
  resultPromise: Promise<WatchlistResult>;
};
export type WatchlistLoadedProps = { result: WatchlistSuccess };
export type WatchlistGridProps = {
  entries: WatchlistEntry[];
  initialNextCursor?: string | null;
};
export type WatchlistCardProps = {
  entry: WatchlistEntry;
  isRemoving: boolean;
  onRemove: (film: WatchlistFilm) => void;
};
