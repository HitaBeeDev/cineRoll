import type { RollFilm } from "@/lib/api";
import { formatContentType } from "@/lib/format/format-content-type";
import { formatFilmYear } from "@/lib/format/format-film-year";
import { formatGenres } from "@/lib/format/format-genres";

/** Compact "year · type · genres · ★ rating" line for a history row; skips missing parts. */
export function formatFilmMeta(film: RollFilm): string {
  return [
    formatFilmYear(film),
    formatContentType(film),
    formatGenres(film),
    film.imdbRating != null ? `★ ${film.imdbRating.toFixed(1)}` : null,
  ]
    .filter(Boolean)
    .join("  ·  ");
}
