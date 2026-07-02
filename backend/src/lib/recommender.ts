import {
  assignVariant,
  recommenderParams,
} from "./experiments";
import { getTasteProfile } from "./tasteProfile";
import { generateCandidates } from "./recommender/candidateRepository";
import { MODEL_VERSION, RECOMMENDER_LIMITS } from "./recommender/constants";
import { getCatalogIdf } from "./recommender/idf";
import { likedFilmsByGenre } from "./recommender/likedFilmsRepository";
import { toRecommendation } from "./recommender/mapper";
import { rankCandidates } from "./recommender/ranking";
import { Recommendation, RecommendationResult } from "./recommender/types";

export { generateCandidates, generateCandidatePool } from "./recommender/candidateRepository";
export { MODEL_VERSION } from "./recommender/constants";
export { rankCandidates } from "./recommender/ranking";
export { scoreFilm } from "./recommender/scoring";
export type { CandidateFilm, Recommendation, RecommendationResult, Scored } from "./recommender/types";

export async function recommend(
  userId: string,
  limit: number = RECOMMENDER_LIMITS.defaultLimit,
): Promise<RecommendationResult> {
  const taste = await getTasteProfile(userId);
  const totalSignals = taste.positiveCount + taste.negativeCount;

  if (isMissingTasteSignal(totalSignals, Object.keys(taste.genreWeights).length > 0)) {
    return { code: "NOT_ENOUGH_DATA", modelVersion: MODEL_VERSION };
  }

  const coldStart = totalSignals < RECOMMENDER_LIMITS.coldStartMinSignals;
  const variant = assignVariant(userId);
  const params = recommenderParams(variant);
  const [candidates, likedByGenre, idf] = await Promise.all([
    generateCandidates(userId, taste),
    coldStart ? Promise.resolve(new Map<string, string>()) : likedFilmsByGenre(userId),
    getCatalogIdf(),
  ]);

  const recommendations: Recommendation[] = rankCandidates(
    candidates,
    taste,
    limit,
    new Date().getFullYear(),
    params,
    idf,
  ).map((scored, index) => toRecommendation(scored, taste, likedByGenre, coldStart, index));

  return { modelVersion: MODEL_VERSION, coldStart, variant, recommendations };
}

function isMissingTasteSignal(totalSignals: number, hasGenreSignal: boolean): boolean {
  return totalSignals < RECOMMENDER_LIMITS.coldStartMinSignals && !hasGenreSignal;
}
