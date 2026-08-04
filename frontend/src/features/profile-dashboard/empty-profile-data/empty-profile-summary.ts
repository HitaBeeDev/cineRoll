import type { ProfileSummary } from "../domain-types";

export const EMPTY_PROFILE_SUMMARY: ProfileSummary = {
  watchlist: 0,
  watched: 0,
  hidden: 0,
  favoriteGenres: [],
  genresFromSignals: false,
};
