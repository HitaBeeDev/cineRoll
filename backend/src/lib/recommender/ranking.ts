import { BASELINE_PARAMS, RecommenderParams } from "../experiments";
import { TasteProfileVectors } from "../tasteProfile";
import { scoreFilm } from "./scoring";
import { filmSimilarity } from "./similarity";
import { CandidateFilm, Scored } from "./types";

export function rankCandidates(
  candidates: CandidateFilm[],
  taste: TasteProfileVectors,
  limit: number,
  currentYear: number = new Date().getFullYear(),
  params: RecommenderParams = BASELINE_PARAMS,
): Scored[] {
  return mmrRerank(
    scoreCandidates(candidates, taste, currentYear, params),
    limit,
    params.mmrLambda,
  );
}

function scoreCandidates(
  candidates: CandidateFilm[],
  taste: TasteProfileVectors,
  currentYear: number,
  params: RecommenderParams,
): Scored[] {
  return candidates
    .map(film => ({ film, score: scoreFilm(film, taste, currentYear, params) }))
    .sort((a, b) => b.score - a.score);
}

function mmrRerank(
  scored: Scored[],
  limit: number,
  lambda: number = BASELINE_PARAMS.mmrLambda,
): Scored[] {
  if (scored.length === 0) return [];

  const normalizedScores = normalizeScores(scored);
  const pool = [...scored];
  const selected: Scored[] = [];

  while (selected.length < limit && pool.length > 0) {
    const bestIndex = bestMmrIndex(pool, selected, normalizedScores, lambda);
    selected.push(pool.splice(bestIndex, 1)[0]!);
  }

  return selected;
}

function normalizeScores(scored: Scored[]): Map<string, number> {
  const scores = scored.map(item => item.score);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  const range = max - min || 1;

  return new Map(scored.map(item => [item.film.id, (item.score - min) / range]));
}

function bestMmrIndex(
  pool: Scored[],
  selected: Scored[],
  normalizedScores: Map<string, number>,
  lambda: number,
): number {
  let bestIndex = 0;
  let bestMmr = -Infinity;

  for (let index = 0; index < pool.length; index++) {
    const mmr = mmrScore(pool[index]!, selected, normalizedScores, lambda);
    if (mmr > bestMmr) {
      bestMmr = mmr;
      bestIndex = index;
    }
  }

  return bestIndex;
}

function mmrScore(
  candidate: Scored,
  selected: Scored[],
  normalizedScores: Map<string, number>,
  lambda: number,
): number {
  const relevance = normalizedScores.get(candidate.film.id) ?? 0;
  const maxSimilarity = selected.reduce(
    (max, selectedFilm) => Math.max(max, filmSimilarity(candidate.film, selectedFilm.film)),
    0,
  );

  return lambda * relevance - (1 - lambda) * maxSimilarity;
}
