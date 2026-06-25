import { CandidateFilm } from "./types";

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
