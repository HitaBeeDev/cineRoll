import { getCatalogIdf } from "../../lib/recommender/idf";
import { cosineSimilarity, tfidfVector } from "../../lib/recommender/tfidf";
import { RandomFilmRow } from "../randomRoute/types";
import { DIFFICULTY_BANDS, Difficulty } from "./constants";

// Confusability-based distractor selection ("hard-negative mining"): decoys that
// are *similar* to the answer make a real puzzle; random films make a giveaway.
//
// Every candidate is scored by TF-IDF cosine similarity to the target over its
// award/genre/decade/creator features (the same primitive the recommender uses —
// docs/algorithms.md §4), so a shared *rare* trait (same director, same festival
// + year) counts far more than a shared common one (both "Drama"). Difficulty
// then selects the similarity band: Hard draws the most-similar decoys (hardest
// to rule out), Easy the clearly-different ones. A little sampling within the
// band keeps one target from always yielding the identical four options.
export async function selectDistractors(
  target: RandomFilmRow,
  pool: RandomFilmRow[],
  difficulty: Difficulty,
  count: number,
): Promise<RandomFilmRow[]> {
  if (pool.length <= count) return pool.slice(0, count);

  const idf = await getCatalogIdf();
  const targetVector = tfidfVector(target, idf);

  const ranked = pool
    .map(film => ({ film, score: cosineSimilarity(targetVector, tfidfVector(film, idf)) }))
    .sort((a, b) => b.score - a.score)
    .map(entry => entry.film);

  return sampleFromBand(ranked, DIFFICULTY_BANDS[difficulty], count);
}

// Slice the similarity-ranked list to its [lo, hi] fractional window, then draw
// `count` at random from it. Falls back to the whole list if the window is too
// thin to fill, so a round never returns fewer options than asked.
export function sampleFromBand(
  ranked: RandomFilmRow[],
  [lo, hi]: readonly [number, number],
  count: number,
): RandomFilmRow[] {
  const n = ranked.length;
  const start = Math.floor(lo * n);
  const end = Math.max(Math.ceil(hi * n), start + count);
  const window = ranked.slice(start, end);
  const pickFrom = window.length >= count ? window : ranked;

  return sampleWithoutReplacement(pickFrom, count);
}

// Fisher–Yates partial shuffle — a correct uniform sample, unlike a
// `sort(() => Math.random() - 0.5)`.
function sampleWithoutReplacement<T>(items: T[], count: number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }

  return copy.slice(0, count);
}
