import { RandomFilmRow } from "../randomRoute/types";
import {
  CANDIDATE_POOL_SIZE,
  DISTRACTOR_COUNT,
  MIN_DECADE_POOL,
  OPTION_COUNT,
} from "./constants";
import { selectDistractors } from "./distractors";
import { getDistractorPool, getRandomTarget, getTargetBySlug } from "./repository";
import { BlindRollQuery } from "./schemas";

export type BlindRoundResult = { film: RandomFilmRow; options: RandomFilmRow[] };

export async function getBlindRound(query: BlindRollQuery): Promise<BlindRoundResult | null> {
  const target = query.film ? await getTargetBySlug(query.film) : await getRandomTarget();
  if (!target) return null;

  const pool = await getDistractorPool(target, CANDIDATE_POOL_SIZE, MIN_DECADE_POOL);
  const distractors = await selectDistractors(target, pool, query.difficulty, DISTRACTOR_COUNT);
  const options = shuffle([target, ...distractors]).slice(0, OPTION_COUNT);

  return { film: target, options };
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }

  return copy;
}
