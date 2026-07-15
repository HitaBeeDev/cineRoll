import { calculateFilmDistance } from "./calculate-film-distance";
import { computeFeatureRanges } from "./compute-feature-ranges";
import type { FilmFeatures } from "./matchmaking-types";

export function buildDistanceMatrix(features: FilmFeatures[]): number[][] {
  const ranges = computeFeatureRanges(features);
  const matrix = Array.from({ length: features.length }, () =>
    new Array<number>(features.length).fill(0),
  );

  for (let left = 0; left < features.length; left += 1) {
    for (let right = left + 1; right < features.length; right += 1) {
      const distance = calculateFilmDistance(
        features[left]!,
        features[right]!,
        ranges,
      );
      matrix[left]![right] = distance;
      matrix[right]![left] = distance;
    }
  }
  return matrix;
}
