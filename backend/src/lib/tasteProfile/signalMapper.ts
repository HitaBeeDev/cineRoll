import { SIGNAL_WEIGHT, sentimentWeight } from "../tasteWeights";
import { Signal } from "./types";
import { TasteSignalRows } from "./signalRepository";

export function mapTasteSignals(rows: TasteSignalRows): Signal[] {
  return [...watchedSignals(rows), ...watchlistSignals(rows)];
}

function watchedSignals(rows: TasteSignalRows): Signal[] {
  return rows.watched.map(watched => ({
    film: watched.film,
    weight: watchedWeight(watched),
    at: watched.watchedAt,
  }));
}

function watchlistSignals(rows: TasteSignalRows): Signal[] {
  return rows.watchlist.map(entry => ({
    film: entry.film,
    weight: SIGNAL_WEIGHT.watchlistAdd,
    at: entry.addedAt,
  }));
}

function watchedWeight(watched: TasteSignalRows["watched"][number]): number {
  if (watched.doNotSuggest) return SIGNAL_WEIGHT.notInterested;
  return sentimentWeight(watched.sentiment);
}
