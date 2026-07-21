import { SIGNAL_WEIGHT, sentimentWeight } from "../../lib/tasteWeights";
import type { Signal } from "../../lib/tasteProfile";
import type { WatchedRow, WatchlistRow } from "./types";

export function buildTrainingSignals(
  watched: WatchedRow[],
  watchlist: WatchlistRow[],
  heldOutIds: Set<string>,
): Signal[] {
  const signals: Signal[] = [];

  appendWatchedSignals(signals, watched, heldOutIds);
  appendWatchlistSignals(signals, watchlist);

  return signals;
}

function appendWatchedSignals(
  signals: Signal[],
  watched: WatchedRow[],
  heldOutIds: Set<string>,
): void {
  for (const entry of watched) {
    if (heldOutIds.has(entry.filmId)) continue;
    signals.push(watchedSignal(entry));
  }
}

function appendWatchlistSignals(signals: Signal[], watchlist: WatchlistRow[]): void {
  for (const entry of watchlist) {
    signals.push({ film: entry.film, weight: SIGNAL_WEIGHT.watchlistAdd, at: entry.addedAt });
  }
}

function watchedSignal(entry: WatchedRow): Signal {
  const weight = entry.doNotSuggest
    ? SIGNAL_WEIGHT.notInterested
    : sentimentWeight(entry.sentiment);

  return {
    film: entry.film,
    weight,
    at: entry.watchedAt,
  };
}
