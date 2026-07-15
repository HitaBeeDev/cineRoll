import { CandidateFilm } from "./repository";
import { distance, filmToVector, TasteVector } from "./model";

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
}

export interface Recommendations {
  hero: RecommendedFilm | null;
  byType: RecommendedFilm[];
}

// One recommendation per type, in the order they're shown. Movies anchor the
// hero, so the row leads with the other types the user asked to see.
const RECOMMEND_TYPES = ["documentary", "animation", "tv-series", "short", "movie"] as const;

// Fit is dominated by taste distance; a small quality nudge only breaks near
// ties (so two equally-on-taste films resolve toward the better-regarded one).
const QUALITY_WEIGHT = 0.02;

const toCard = (f: CandidateFilm): RecommendedFilm => ({
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
 * Rank the pool by fit to the taste profile and pick a spread of picks:
 *  - `hero` — the best-fitting movie ("watch next"), the broad, safe headline.
 *  - `byType` — the single best-fitting film of each remaining content type, so
 *    the result covers documentary/animation/TV/short as well.
 * Quiz films (and the hero) are excluded so nothing repeats.
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

  const hero = ranked.find((r) => r.film.contentType === "movie") ?? ranked[0];
  const heroId = hero?.film.id;

  const byType: RecommendedFilm[] = [];
  for (const type of RECOMMEND_TYPES) {
    const pick = ranked.find(
      (r) => r.film.contentType === type && r.film.id !== heroId,
    );
    if (pick) byType.push(toCard(pick.film));
  }

  return { hero: hero ? toCard(hero.film) : null, byType };
}
