import { TasteProfileVectors } from "./types";

export const emptyWeights = {};

export function emptyTasteProfile(): TasteProfileVectors {
  return {
    genreWeights: {},
    directorWeights: {},
    decadeWeights: {},
    runtimeBandWeights: {},
    awardAffinity: {},
    ratingTier: {},
    positiveCount: 0,
    negativeCount: 0,
  };
}
