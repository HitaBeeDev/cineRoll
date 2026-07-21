import { CandidateFilm } from "./repository";
import { distance, filmToVector, matchPercent, TasteVector } from "./model";

/** A recommendation card for the result screen. */
export interface RecommendedFilm {
  id: string;
  slug: string;
  title: string;
  year: number;
  contentType: string;
  posterUrl: string | null;
  posterColor: string | null;
  backdropUrl: string | null;
  imdbRating: number | null;
  genres: string[];
  director: string | null;
  /** 0–100 fit to the taste profile, shown on the card. */
  match: number;
}

export interface Recommendations {
  /** The single best-fitting film of any kind — the headline pick. */
  hero: RecommendedFilm | null;
  /** One pick per content type (excluding the hero) — the "every kind" row. */
  byType: RecommendedFilm[];
}

// One recommendation per content type, in the order they're shown — a film leads,
// then the other kinds the user asked to see.
const RECOMMEND_TYPES = ["movie", "documentary", "animation", "tv-series", "short"] as const;

// Fit is dominated by taste distance; a small quality nudge only breaks near
// ties (so two equally-on-taste films resolve toward the better-regarded one).
const QUALITY_WEIGHT = 0.02;

const toCard = (f: CandidateFilm, profile: TasteVector): RecommendedFilm => ({
  id: f.id,
  slug: f.slug,
  title: f.title,
  year: f.year,
  contentType: f.contentType,
  posterUrl: f.posterUrl,
  posterColor: f.posterColor,
  backdropUrl: f.backdropUrl,
  imdbRating: f.imdbRating,
  genres: f.genres,
  director: f.director,
  match: matchPercent(distance(filmToVector(f), profile)),
});

/** Lower is better: taste distance, minus a small bonus for well-regarded films. */
function fitCost(film: CandidateFilm, profile: TasteVector): number {
  const quality =
    (film.imdbRating ?? 6) +
    film.oscarWins * 0.6 +
    film.cannesWins * 0.6 +
    film.berlinWins * 0.6 +
    film.ggWins * 0.4;
  return distance(filmToVector(film), profile) - quality * QUALITY_WEIGHT;
}

/**
 * Rank the pool by fit to the taste profile and return two things: the single
 * best-fitting film of any kind (the headline "perfect match"), and the best of
 * each content type below it (excluding the hero), so the result still covers a
 * film plus a documentary/animation/TV/short. Quiz films are excluded so nothing
 * repeats.
 */
export function recommend(
  profile: TasteVector,
  pool: CandidateFilm[],
  excludeIds: Set<string>,
): Recommendations {
  const ranked = pool
    .filter((f) => !excludeIds.has(f.id))
    .map((film) => ({ film, cost: fitCost(film, profile) }))
    .sort((a, b) => a.cost - b.cost);

  const hero = ranked[0] ? toCard(ranked[0].film, profile) : null;

  const byType: RecommendedFilm[] = [];
  for (const type of RECOMMEND_TYPES) {
    const pick = ranked.find(
      (r) => r.film.contentType === type && r.film.id !== hero?.id,
    );
    if (pick) byType.push(toCard(pick.film, profile));
  }

  return { hero, byType };
}
