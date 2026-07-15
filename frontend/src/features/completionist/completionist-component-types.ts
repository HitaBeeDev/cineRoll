import type {
  CompletionCategoryProgress,
  CompletionProgress,
  CompletionProgressCount,
} from "@cineroll/types";

export type CompletionProgressBarProps = {
  percentage: number;
  reduceMotion: boolean;
  delay?: number;
  className: string;
};

export type CompletionistTrackerProps = {
  progress: CompletionProgress;
};

export type CompletionistSummaryProps = {
  overall: CompletionProgressCount;
};

export type CompletionCategoryListProps = {
  categories: CompletionCategoryProgress[];
  reduceMotion: boolean;
};
