import type { ReactNode } from "react";
import type {
  WatchedEntry,
  WatchedFilm,
  WatchedResult,
  WatchedSuccess,
} from "./domain-types";

export type HistoryBodyProps = {
  resultPromise: Promise<WatchedResult>;
};
export type HistoryLoadedProps = { result: WatchedSuccess };
export type HistoryGridProps = {
  entries: WatchedEntry[];
  initialNextCursor?: string | null;
};
export type HistoryCardProps = {
  busy: boolean;
  entry: WatchedEntry;
  onRate: (film: WatchedFilm, value: "like" | "dislike") => void;
  onRemove: (film: WatchedFilm) => void;
};
export type ReRateButtonProps = {
  active: boolean;
  disabled?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  tone: "like" | "dislike";
};
