import type { CompletionProgress } from "@cineroll/types";
import type {
  ProfileSummary,
  RecommendationsResult,
} from "./domain-types";

export const EMPTY_PROFILE_SUMMARY: ProfileSummary = {
  watchlist: 0,
  watched: 0,
  hidden: 0,
  favoriteGenres: [],
  genresFromSignals: false,
};

export const EMPTY_COMPLETION_PROGRESS: CompletionProgress = {
  overall: { watched: 0, total: 0, percentage: 0 },
  categories: [],
};

export const EMPTY_RECOMMENDATIONS_RESULT: RecommendationsResult = {
  recommendations: [],
  coldStart: false,
  notEnoughData: false,
};
