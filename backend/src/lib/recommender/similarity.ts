import { cosineSimilarity, SparseVector } from "./tfidf";
import { CandidateFilm } from "./types";

// TF-IDF cosine similarity between two films, given their precomputed vectors.
// This is what the MMR reranker uses for diversity: a shared *rare* feature
// (e.g. "Film-Noir", same director) pulls similarity up far more than a shared
// common one (e.g. "Drama"), because IDF already down-weighted the common term.
export function tfidfSimilarity(
  a: CandidateFilm,
  b: CandidateFilm,
  vectors: Map<string, SparseVector>,
): number {
  const vectorA = vectors.get(a.id);
  const vectorB = vectors.get(b.id);
  if (!vectorA || !vectorB) return 0;

  return cosineSimilarity(vectorA, vectorB);
}

// Legacy raw-Jaccard similarity — superseded by `tfidfSimilarity` in the MMR
// path (TF-IDF weights features by rarity; Jaccard treats them all equally).
// Kept as a cheap, dependency-free baseline and for tests/comparison.
export function filmSimilarity(a: CandidateFilm, b: CandidateFilm): number {
  return 0.7 * genreJaccard(a, b) + 0.3 * sameDirector(a, b);
}

function genreJaccard(a: CandidateFilm, b: CandidateFilm): number {
  const bGenres = new Set(b.genres);
  const intersection = a.genres.filter(genre => bGenres.has(genre)).length;
  const union = new Set([...a.genres, ...b.genres]).size;

  return union > 0 ? intersection / union : 0;
}

function sameDirector(a: CandidateFilm, b: CandidateFilm): number {
  return a.director && a.director === b.director ? 1 : 0;
}
