import {
  SENTIMENT_WEIGHT,
  SIGNAL_WEIGHT,
  sentimentWeight,
  type SentimentWeights,
} from "../../lib/tasteWeights";
import type { Signal } from "../../lib/tasteProfile";
import type { WatchedRow, WatchlistRow } from "./types";

export function buildTrainingSignals(
  watched: WatchedRow[],
  watchlist: WatchlistRow[],
  heldOutIds: Set<string>,
  weights: SentimentWeights = SENTIMENT_WEIGHT,
): Signal[] {
  const signals: Signal[] = [];

  appendWatchedSignals(signals, watched, heldOutIds, weights);
  appendWatchlistSignals(signals, watchlist);

  return signals;
}

function appendWatchedSignals(
  signals: Signal[],
  watched: WatchedRow[],
  heldOutIds: Set<string>,
  weights: SentimentWeights,
): void {
  for (const entry of watched) {
    if (heldOutIds.has(entry.filmId)) continue;
    signals.push(watchedSignal(entry, weights));
  }
}

function appendWatchlistSignals(signals: Signal[], watchlist: WatchlistRow[]): void {
  for (const entry of watchlist) {
    signals.push({ film: entry.film, weight: SIGNAL_WEIGHT.watchlistAdd, at: entry.addedAt });
  }
}

function watchedSignal(entry: WatchedRow, weights: SentimentWeights): Signal {
  const weight = entry.doNotSuggest
    ? SIGNAL_WEIGHT.notInterested
    : sentimentWeight(entry.sentiment, weights);

  return {
    film: entry.film,
    weight,
    at: entry.watchedAt,
  };
}
