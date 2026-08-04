import type { RollFilm } from "@/lib/api";
import { formatContentType } from "@/lib/format/format-content-type";
import { formatFilmLength } from "@/lib/format/format-film-length";
import { formatFilmYear } from "@/lib/format/format-film-year";
import { formatGenres } from "@/lib/format/format-genres";

/** Year · type · genres · length, skipping whatever the film doesn't have. */
export function getPickMetadata(film: RollFilm): string[] {
  return [
    formatFilmYear(film),
    formatContentType(film),
    formatGenres(film),
    formatFilmLength(film),
  ].filter(Boolean);
}
