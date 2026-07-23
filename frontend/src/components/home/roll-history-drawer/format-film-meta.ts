import type { RollFilm } from "@/lib/api";

/** Compact "year · genre · ★ rating" line for a history row; skips missing parts. */
export function formatFilmMeta(film: RollFilm): string {
  return [
    film.year,
    film.genres?.[0],
    film.imdbRating != null ? `★ ${film.imdbRating.toFixed(1)}` : null,
  ]
    .filter(Boolean)
    .join("  ·  ");
}
