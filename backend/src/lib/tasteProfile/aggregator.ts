import { recencyDecay } from "../tasteWeights";
import { DAY_MS, TASTE_PROFILE_CONFIG } from "./constants";
import { filmFeatureKeys } from "./filmFeatures";
import { addWeight, normalize } from "./vectorMath";
import { Signal, TasteProfileVectors, Vector } from "./types";

type MutableProfileVectors = {
  genreWeights: Vector;
  directorWeights: Vector;
  decadeWeights: Vector;
  runtimeBandWeights: Vector;
  awardAffinity: Vector;
  ratingTier: Vector;
};

export function aggregateTasteVectors(
  signals: Signal[],
  onboardingGenres: string[],
): TasteProfileVectors {
  const vectors = emptyMutableVectors();
  const signalCounts = accumulateSignals(vectors, signals);

  if (shouldSeedColdStart(signalCounts.positiveCount, onboardingGenres)) {
    applyOnboardingGenreSeeds(vectors.genreWeights, onboardingGenres);
  }

  return {
    genreWeights: normalize(vectors.genreWeights),
    directorWeights: normalize(vectors.directorWeights),
    decadeWeights: normalize(vectors.decadeWeights),
    runtimeBandWeights: normalize(vectors.runtimeBandWeights),
    awardAffinity: normalize(vectors.awardAffinity),
    ratingTier: normalize(vectors.ratingTier),
    ...signalCounts,
  };
}

function emptyMutableVectors(): MutableProfileVectors {
  return {
    genreWeights: {},
    directorWeights: {},
    decadeWeights: {},
    runtimeBandWeights: {},
    awardAffinity: {},
    ratingTier: {},
  };
}

function accumulateSignals(vectors: MutableProfileVectors, signals: Signal[]) {
  let positiveCount = 0;
  let negativeCount = 0;
  const now = Date.now();

  for (const signal of signals) {
    if (signal.weight > 0) positiveCount++;
    else if (signal.weight < 0) negativeCount++;

    addSignal(vectors, signal, now);
  }

  return { positiveCount, negativeCount };
}

function addSignal(vectors: MutableProfileVectors, signal: Signal, now: number): void {
  const features = filmFeatureKeys(signal.film);
  const weight = decayedWeight(signal, now);

  for (const genre of features.genres) addWeight(vectors.genreWeights, genre, weight);
  addWeight(vectors.directorWeights, features.director, weight);
  addWeight(vectors.decadeWeights, features.decade, weight);
  addWeight(vectors.runtimeBandWeights, features.runtimeBand, weight);
  for (const award of features.awards) addWeight(vectors.awardAffinity, award, weight);
  for (const tier of features.ratingTiers) addWeight(vectors.ratingTier, tier, weight);
}

function decayedWeight(signal: Signal, now: number): number {
  const ageDays = (now - signal.at.getTime()) / DAY_MS;

  return signal.weight * recencyDecay(ageDays);
}

function shouldSeedColdStart(positiveCount: number, onboardingGenres: string[]): boolean {
  return positiveCount < TASTE_PROFILE_CONFIG.coldStartThreshold && onboardingGenres.length > 0;
}

function applyOnboardingGenreSeeds(genreWeights: Vector, onboardingGenres: string[]): void {
  const count = onboardingGenres.length;

  onboardingGenres.forEach((genre, index) => {
    addWeight(
      genreWeights,
      genre,
      TASTE_PROFILE_CONFIG.coldStartSeed * (1 - index / count),
    );
  });
}
