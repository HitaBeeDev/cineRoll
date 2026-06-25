import { BASELINE_PARAMS, type RecommenderParams } from "../../lib/experiments";
import { generateCandidatePool, rankCandidates } from "../../lib/recommender";
import { aggregateTasteVectors } from "../../lib/tasteProfile";
import { COLD_START_MIN } from "./config";
import { hasEnoughLikedFilms, holdoutFilmIds, likedFilmRefs } from "./holdout";
import { scoreRanking } from "./metricSummary";
import { buildTrainingSignals } from "./profileSignals";
import { touchedFilmIds } from "./touchedFilms";
import type { UserMetrics } from "./types";
import { loadUserSignalRows } from "./userSignalRepository";

export async function evaluateUser(
  userId: string,
  kValues: number[],
  maxK: number,
  params: RecommenderParams = BASELINE_PARAMS,
): Promise<UserMetrics | null> {
  const rows = await loadUserSignalRows(userId);
  const liked = likedFilmRefs(rows.watched, rows.ratings);

  if (!hasEnoughLikedFilms(liked)) return null;

  const heldOutIds = holdoutFilmIds(liked);
  const signals = buildTrainingSignals(rows.watched, rows.ratings, rows.watchlist, heldOutIds);
  const taste = aggregateTasteVectors(signals, rows.onboardingGenres);

  if (isColdStart(taste.positiveCount, rows.onboardingGenres)) return null;

  const excludedIds = touchedFilmIds(rows.watched, rows.watchlist, heldOutIds);
  const candidates = await generateCandidatePool(excludedIds, taste);
  const rankedIds = rankCandidates(candidates, taste, maxK, new Date().getFullYear(), params)
    .map(result => result.film.id);

  return scoreRanking(rankedIds, heldOutIds, kValues);
}

function isColdStart(positiveCount: number, onboardingGenres: string[]): boolean {
  return positiveCount < COLD_START_MIN && onboardingGenres.length === 0;
}
