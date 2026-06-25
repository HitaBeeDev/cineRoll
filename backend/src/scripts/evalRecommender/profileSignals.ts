import { SIGNAL_WEIGHT, ratingWeight, sentimentWeight } from "../../lib/tasteWeights";
import type { Signal } from "../../lib/tasteProfile";
import type { RatingRow, WatchedRow, WatchlistRow } from "./types";

export function buildTrainingSignals(
  watched: WatchedRow[],
  ratings: RatingRow[],
  watchlist: WatchlistRow[],
  heldOutIds: Set<string>,
): Signal[] {
  const signals: Signal[] = [];
  const ratingsByFilmId = new Map(ratings.map(rating => [rating.filmId, rating]));
  const consumedRatingFilmIds = new Set<string>();

  appendWatchedSignals(signals, watched, ratingsByFilmId, consumedRatingFilmIds, heldOutIds);
  appendRatingSignals(signals, ratings, consumedRatingFilmIds, heldOutIds);
  appendWatchlistSignals(signals, watchlist);

  return signals;
}

function appendWatchedSignals(
  signals: Signal[],
  watched: WatchedRow[],
  ratingsByFilmId: Map<string, RatingRow>,
  consumedRatingFilmIds: Set<string>,
  heldOutIds: Set<string>,
): void {
  for (const entry of watched) {
    if (heldOutIds.has(entry.filmId)) continue;
    const rating = ratingsByFilmId.get(entry.filmId);
    if (rating) consumedRatingFilmIds.add(entry.filmId);
    signals.push(watchedSignal(entry, rating));
  }
}

function appendRatingSignals(
  signals: Signal[],
  ratings: RatingRow[],
  consumedRatingFilmIds: Set<string>,
  heldOutIds: Set<string>,
): void {
  for (const rating of ratings) {
    if (heldOutIds.has(rating.filmId)) continue;
    if (consumedRatingFilmIds.has(rating.filmId)) continue;
    signals.push({ film: rating.film, weight: ratingWeight(rating.rating), at: rating.updatedAt });
  }
}

function appendWatchlistSignals(signals: Signal[], watchlist: WatchlistRow[]): void {
  for (const entry of watchlist) {
    signals.push({ film: entry.film, weight: SIGNAL_WEIGHT.watchlistAdd, at: entry.addedAt });
  }
}

function watchedSignal(entry: WatchedRow, rating: RatingRow | undefined): Signal {
  const weight = entry.doNotSuggest
    ? SIGNAL_WEIGHT.notInterested
    : rating
      ? ratingWeight(rating.rating)
      : sentimentWeight(entry.sentiment);

  return {
    film: entry.film,
    weight,
    at: rating?.updatedAt ?? entry.watchedAt,
  };
}
