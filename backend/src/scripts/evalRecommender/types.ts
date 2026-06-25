import type { Signal } from "../../lib/tasteProfile";

export type Args = {
  maxUsers: number | null;
  kValues: number[];
  mmrLambdas: number[] | null;
};

export type LikedFilmRef = {
  filmId: string;
  at: Date;
};

export type WatchedRow = {
  filmId: string;
  sentiment: "like" | "dislike" | null;
  doNotSuggest: boolean;
  watchedAt: Date;
  film: Signal["film"];
};

export type WatchlistRow = {
  filmId: string;
  addedAt: Date;
  film: Signal["film"];
};

export type RatingRow = {
  filmId: string;
  rating: number;
  updatedAt: Date;
  film: Signal["film"];
};

export type UserSignalRows = {
  watched: WatchedRow[];
  watchlist: WatchlistRow[];
  ratings: RatingRow[];
  onboardingGenres: string[];
};

export type UserMetrics = {
  recall: Record<number, number>;
  precision: Record<number, number>;
  reciprocalRank: number;
};

export type EvaluationRun = {
  results: UserMetrics[];
  skipped: number;
};

export type EvalRecord = {
  modelVersion: string;
  ranAt: string;
  usersEvaluated: number;
  usersSkipped: number;
  recall: Record<string, number>;
  precision: Record<string, number>;
  mrr: number;
};
