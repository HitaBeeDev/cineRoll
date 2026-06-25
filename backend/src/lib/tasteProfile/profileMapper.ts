import { UserTasteProfile } from "@prisma/client";

import { emptyTasteProfile } from "./emptyProfile";
import { asVector } from "./profileRepository";
import { TasteProfileVectors } from "./types";

export function toTasteProfileVectors(
  row: UserTasteProfile | null,
): TasteProfileVectors {
  if (row === null) return emptyTasteProfile();

  return {
    genreWeights: asVector(row.genreWeights),
    directorWeights: asVector(row.directorWeights),
    decadeWeights: asVector(row.decadeWeights),
    runtimeBandWeights: asVector(row.runtimeBandWeights),
    awardAffinity: asVector(row.awardAffinity),
    ratingTier: asVector(row.ratingTier),
    positiveCount: row.positiveCount,
    negativeCount: row.negativeCount,
  };
}
