import { Prisma } from "@prisma/client";

import { filmFeatureSelect } from "./filmFeatures";

export type FilmFeatures = Prisma.FilmGetPayload<{ select: typeof filmFeatureSelect }>;

export type Vector = Record<string, number>;

export type TasteProfileVectors = {
  genreWeights: Vector;
  directorWeights: Vector;
  decadeWeights: Vector;
  runtimeBandWeights: Vector;
  awardAffinity: Vector;
  ratingTier: Vector;
  positiveCount: number;
  negativeCount: number;
};

export type Signal = {
  film: FilmFeatures;
  weight: number;
  at: Date;
};
