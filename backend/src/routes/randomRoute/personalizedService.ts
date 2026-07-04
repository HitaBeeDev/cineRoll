import { RandomQuery } from "../../lib/filmFilters/randomQuerySchema";
import { scoreFilm } from "../../lib/recommender";
import { getTasteProfile } from "../../lib/tasteProfile";
import {
  EXPLORATION_EPSILON,
  PERSONALIZED_POOL_SIZE,
  SOFTMAX_TEMPERATURE,
} from "./constants";
import { getRandomFilm, getPersonalizedPool } from "./randomRepository";
import { weightedSample, uniformSample } from "./weightedSample";
import { PersonalizedRandomFilmResult, RandomFilmRow } from "./types";

export async function getPersonalizedRandomFilm(
  query: RandomQuery,
): Promise<PersonalizedRandomFilmResult> {
  const { userId } = query;
  if (!userId) {
    return { ...(await getRandomFilm(query)), exploration: false };
  }

  const { pool, total } = await getPersonalizedPool(query, PERSONALIZED_POOL_SIZE);
  if (pool.length === 0) return { film: null, total, exploration: false };

  if (shouldExplore()) {
    return { film: uniformSample(pool), total, exploration: true };
  }

  return {
    film: await tasteWeightedPick(pool, userId),
    total,
    exploration: false,
  };
}

function shouldExplore(): boolean {
  return Math.random() < EXPLORATION_EPSILON;
}

async function tasteWeightedPick(pool: RandomFilmRow[], userId: string): Promise<RandomFilmRow> {
  const taste = await getTasteProfile(userId);
  const currentYear = new Date().getFullYear();
  const scores = pool.map(film => scoreFilm(film, taste, currentYear));

  return weightedSample(pool, softmaxWeights(scores));
}

// Softmax over raw scores → sampling weights. Subtracting the max keeps exp()
// numerically stable (no overflow) while leaving the relative weights unchanged.
// A lower temperature sharpens the distribution toward the top score; a higher
// one flattens it toward uniform.
export function softmaxWeights(
  scores: number[],
  temperature: number = SOFTMAX_TEMPERATURE,
): number[] {
  const maxScore = Math.max(...scores);

  return scores.map(score => Math.exp((score - maxScore) / temperature));
}
