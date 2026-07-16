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

// Folds a user's raw signals into the six taste vectors (genre / director /
// decade / runtime band / award / rating tier). Each signal adds its weight —
// recency-decayed, 90-day half-life — to every feature of its film; each vector
// is then normalized by its largest absolute weight so a 5-signal user and a
// 500-signal user land on the same scale.
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

// Cold-start seeding: with almost no real signals, the genres picked at
// onboarding stand in for taste. Weight descends with pick order (first pick
// counts most), and the seed is deliberately weak (0.5 vs a like's 1.0) so the
// first few real signals immediately start outvoting the questionnaire.
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
