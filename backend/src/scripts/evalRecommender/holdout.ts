import { HOLDOUT_FRACTION, HOLDOUT_MAX, MIN_LIKED } from "./config";
import type { LikedFilmRef, RatingRow, WatchedRow } from "./types";
import { ratingWeight } from "../../lib/tasteWeights";

export function likedFilmRefs(watched: WatchedRow[], ratings: RatingRow[]): LikedFilmRef[] {
  const positiveRows = [
    ...watched
      .filter(entry => entry.sentiment === "like" && !entry.doNotSuggest)
      .map(entry => ({ filmId: entry.filmId, at: entry.watchedAt })),
    ...ratings
      .filter(entry => ratingWeight(entry.rating) > 0)
      .map(entry => ({ filmId: entry.filmId, at: entry.updatedAt })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  return Array.from(new Map(positiveRows.map(row => [row.filmId, row])).values());
}

export function hasEnoughLikedFilms(liked: LikedFilmRef[]): boolean {
  return liked.length >= MIN_LIKED;
}

export function holdoutFilmIds(liked: LikedFilmRef[]): Set<string> {
  const holdoutCount = Math.max(
    1,
    Math.min(HOLDOUT_MAX, Math.floor(liked.length * HOLDOUT_FRACTION)),
  );

  return new Set(liked.slice(0, holdoutCount).map(row => row.filmId));
}
