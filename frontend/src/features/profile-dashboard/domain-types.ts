import type { Recommendation } from "@/types/recommendation";

export type ProfileSummary = {
  watchlist: number;
  watched: number;
  hidden: number;
  rated: number;
  favoriteGenres: string[];
  genresFromRatings: boolean;
};

export type RecommendationsResult = {
  recommendations: Recommendation[];
  coldStart: boolean;
  notEnoughData: boolean;
};
