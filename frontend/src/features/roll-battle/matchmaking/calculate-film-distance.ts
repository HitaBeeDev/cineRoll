import { calculateJaccardDistance } from "./jaccard-distance";
import type {
  FeatureRanges,
  FilmFeatures,
  NumericDistanceSignal,
} from "./matchmaking-types";
import { MATCHMAKING_WEIGHTS } from "./matchmaking-weights";

export function calculateFilmDistance(
  left: FilmFeatures,
  right: FilmFeatures,
  ranges: FeatureRanges,
): number {
  const numericSignals = [
    numericDistance(left.year, right.year, ranges.year, MATCHMAKING_WEIGHTS.year),
    numericDistance(
      left.runtime,
      right.runtime,
      ranges.runtime,
      MATCHMAKING_WEIGHTS.runtime,
    ),
    numericDistance(
      left.rating,
      right.rating,
      ranges.rating,
      MATCHMAKING_WEIGHTS.rating,
    ),
  ].filter((signal): signal is NumericDistanceSignal => signal != null);
  const weightedNumeric = numericSignals.reduce(
    (total, signal) =>
      total + signal.weight * (Math.abs(signal.left - signal.right) / signal.range),
    0,
  );
  const numericWeight = numericSignals.reduce(
    (total, signal) => total + signal.weight,
    0,
  );
  const genreDistance =
    MATCHMAKING_WEIGHTS.genre *
    calculateJaccardDistance(left.genres, right.genres);
  const mediumDistance =
    MATCHMAKING_WEIGHTS.medium *
    (left.isDocumentary === right.isDocumentary ? 0 : 1);
  const totalWeight =
    numericWeight + MATCHMAKING_WEIGHTS.genre + MATCHMAKING_WEIGHTS.medium;
  return (weightedNumeric + genreDistance + mediumDistance) / totalWeight;
}

function numericDistance(
  left: number | null,
  right: number | null,
  range: number,
  weight: number,
): NumericDistanceSignal | null {
  return left == null || right == null || range <= 0
    ? null
    : { left, right, range, weight };
}
