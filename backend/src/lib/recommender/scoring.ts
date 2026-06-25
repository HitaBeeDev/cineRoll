import { BASELINE_PARAMS, RecommenderParams } from "../experiments";
import {
  filmFeatureKeys,
  FilmFeatures,
  TasteProfileVectors,
} from "../tasteProfile";
import { RECENCY_BASE_YEAR, SCORE_DIMENSIONS } from "./constants";

export function scoreFilm(
  film: FilmFeatures,
  taste: TasteProfileVectors,
  currentYear: number,
  params: RecommenderParams = BASELINE_PARAMS,
): number {
  return (
    tasteScore(film, taste) +
    params.qualityWeight * qualityPrior(film) +
    params.recencyWeight * recencyPrior(film, currentYear)
  );
}

function tasteScore(film: FilmFeatures, taste: TasteProfileVectors): number {
  const features = filmFeatureKeys(film);
  let score = 0;

  for (const genre of features.genres) {
    score += SCORE_DIMENSIONS.genre * (taste.genreWeights[genre] ?? 0);
  }

  if (features.director) {
    score += SCORE_DIMENSIONS.director * (taste.directorWeights[features.director] ?? 0);
  }

  if (features.decade) {
    score += SCORE_DIMENSIONS.decade * (taste.decadeWeights[features.decade] ?? 0);
  }

  if (features.runtimeBand) {
    score += SCORE_DIMENSIONS.runtime * (taste.runtimeBandWeights[features.runtimeBand] ?? 0);
  }

  for (const award of features.awards) {
    score += SCORE_DIMENSIONS.award * (taste.awardAffinity[award] ?? 0);
  }

  for (const tier of features.ratingTiers) {
    score += SCORE_DIMENSIONS.rating * (taste.ratingTier[tier] ?? 0);
  }

  return score;
}

function qualityPrior(film: FilmFeatures): number {
  const ratingPrior = averageRatingPrior(film);
  const awardPrior = awardQualityPrior(film);

  return 0.75 * ratingPrior + 0.25 * awardPrior;
}

function averageRatingPrior(film: FilmFeatures): number {
  const ratings: number[] = [];

  if (film.imdbRating != null) ratings.push(film.imdbRating / 10);
  if (film.rtScore != null) ratings.push(film.rtScore / 100);

  return ratings.length
    ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
    : 0.4;
}

function awardQualityPrior(film: FilmFeatures): number {
  const wins = film.oscarWins + film.ggWins + film.cannesWins + film.berlinWins;
  const nominations =
    film.oscarNominations +
    film.ggNominations +
    film.cannesNominations +
    film.berlinNominations;

  return Math.min(1, (wins + nominations * 0.25) / 4);
}

function recencyPrior(film: FilmFeatures, currentYear: number): number {
  const span = currentYear - RECENCY_BASE_YEAR;
  if (span <= 0) return 0.5;

  return Math.min(1, Math.max(0, (film.releaseYear - RECENCY_BASE_YEAR) / span));
}
