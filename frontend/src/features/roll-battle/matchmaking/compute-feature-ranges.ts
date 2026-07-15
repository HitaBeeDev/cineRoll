import type { FeatureRanges, FilmFeatures } from "./matchmaking-types";

export function computeFeatureRanges(features: FilmFeatures[]): FeatureRanges {
  return {
    year: calculateSpread(features.map((feature) => feature.year)),
    runtime: calculateSpread(features.map((feature) => feature.runtime)),
    rating: calculateSpread(features.map((feature) => feature.rating)),
  };
}

function calculateSpread(values: Array<number | null>): number {
  const presentValues = values.filter((value): value is number => value != null);
  if (presentValues.length === 0) return 0;
  return Math.max(...presentValues) - Math.min(...presentValues);
}
