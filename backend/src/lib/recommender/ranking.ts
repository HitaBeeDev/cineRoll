import { BASELINE_PARAMS, RecommenderParams } from "../experiments";
import { TasteProfileVectors } from "../tasteProfile";
import { scoreFilm } from "./scoring";
import { tfidfSimilarity } from "./similarity";
import { buildIdf } from "./tfidf/buildIdf";
import { createTfidfVector } from "./tfidf/createTfidfVector";
import type { IdfTable, SparseVector } from "./tfidf/types";
import { CandidateFilm, Scored } from "./types";

export function rankCandidates(
  candidates: CandidateFilm[],
  taste: TasteProfileVectors,
  limit: number,
  currentYear: number = new Date().getFullYear(),
  params: RecommenderParams = BASELINE_PARAMS,
  idf?: IdfTable,
): Scored[] {
  // Prefer a catalog-wide IDF (passed in, cached) so rarity is measured against
  // the whole library; fall back to IDF over just this candidate pool when none
  // is supplied (keeps the function pure and self-contained for tests/scripts).
  const idfTable = idf ?? buildIdf(candidates);
  const vectors = new Map<string, SparseVector>(
    candidates.map(film => [film.id, createTfidfVector(film, idfTable)]),
  );

  return mmrRerank(
    scoreCandidates(candidates, taste, currentYear, params),
    limit,
    vectors,
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

// Maximal Marginal Relevance: greedily pick the film that best balances high
// relevance against low similarity to what's already selected, so the list
// isn't six near-identical titles. Similarity is now TF-IDF cosine (§tfidf.ts).
function mmrRerank(
  scored: Scored[],
  limit: number,
  vectors: Map<string, SparseVector>,
  lambda: number = BASELINE_PARAMS.mmrLambda,
): Scored[] {
  if (scored.length === 0) return [];

  const normalizedScores = normalizeScores(scored);
  const pool = [...scored];
  const selected: Scored[] = [];

  while (selected.length < limit && pool.length > 0) {
    const bestIndex = bestMmrIndex(pool, selected, normalizedScores, vectors, lambda);
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
  vectors: Map<string, SparseVector>,
  lambda: number,
): number {
  let bestIndex = 0;
  let bestMmr = -Infinity;

  for (let index = 0; index < pool.length; index++) {
    const mmr = mmrScore(pool[index]!, selected, normalizedScores, vectors, lambda);
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
  vectors: Map<string, SparseVector>,
  lambda: number,
): number {
  const relevance = normalizedScores.get(candidate.film.id) ?? 0;
  const maxSimilarity = selected.reduce(
    (max, selectedFilm) =>
      Math.max(max, tfidfSimilarity(candidate.film, selectedFilm.film, vectors)),
    0,
  );

  return lambda * relevance - (1 - lambda) * maxSimilarity;
}
