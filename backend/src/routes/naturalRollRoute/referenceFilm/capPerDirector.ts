import type { RandomFilmRow } from "../../random";

// Shared-director is the strongest criterion in the similarity score, so an
// anchor by a prolific director returns a pool that is mostly that director.
// Six films by one person is a filmography, not a set of recommendations —
// the same concentration problem MMR solves for the recommender, at the scale
// this path actually needs.
const MAX_PER_DIRECTOR = 2;

/** Thin out same-director runs while preserving similarity order. Films the cap
 *  displaces are appended rather than dropped, so the pool never shrinks below
 *  what the reranker needs to work with. */
export const capPerDirector = (films: RandomFilmRow[]): RandomFilmRow[] => {
  const counts = new Map<string, number>();
  const kept: RandomFilmRow[] = [];
  const overflow: RandomFilmRow[] = [];

  for (const film of films) {
    if (!film.director) {
      kept.push(film);
      continue;
    }

    const seen = counts.get(film.director) ?? 0;
    counts.set(film.director, seen + 1);
    (seen < MAX_PER_DIRECTOR ? kept : overflow).push(film);
  }

  return [...kept, ...overflow];
};
