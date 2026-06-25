import {
  SIGNAL_WEIGHT,
  ratingWeight,
  sentimentWeight,
} from "../tasteWeights";
import { Signal } from "./types";
import { TasteSignalRows } from "./signalRepository";

export function mapTasteSignals(rows: TasteSignalRows): Signal[] {
  return [
    ...watchedSignals(rows),
    ...standaloneRatingSignals(rows),
    ...watchlistSignals(rows),
  ];
}

function watchedSignals(rows: TasteSignalRows): Signal[] {
  const ratingsByFilmId = new Map(rows.ratings.map(rating => [rating.filmId, rating]));

  return rows.watched.map(watched => {
    const rating = ratingsByFilmId.get(watched.filmId);

    return {
      film: watched.film,
      weight: watchedWeight(watched, rating),
      at: rating?.updatedAt ?? watched.watchedAt,
    };
  });
}

function standaloneRatingSignals(rows: TasteSignalRows): Signal[] {
  const watchedFilmIds = new Set(rows.watched.map(watched => watched.filmId));

  return rows.ratings
    .filter(rating => !watchedFilmIds.has(rating.filmId))
    .map(rating => ({
      film: rating.film,
      weight: ratingWeight(rating.rating),
      at: rating.updatedAt,
    }));
}

function watchlistSignals(rows: TasteSignalRows): Signal[] {
  return rows.watchlist.map(entry => ({
    film: entry.film,
    weight: SIGNAL_WEIGHT.watchlistAdd,
    at: entry.addedAt,
  }));
}

function watchedWeight(
  watched: TasteSignalRows["watched"][number],
  rating: TasteSignalRows["ratings"][number] | undefined,
): number {
  if (watched.doNotSuggest) return SIGNAL_WEIGHT.notInterested;
  if (rating) return ratingWeight(rating.rating);

  return sentimentWeight(watched.sentiment);
}
