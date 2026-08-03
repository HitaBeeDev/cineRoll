import type { RollFilm } from "@/lib/api";
import { formatContentType, formatFilmLength, formatFilmYear, formatGenres } from "@/lib/format";

/** Year · type · genres · length, skipping whatever the film doesn't have. */
export function getPickMetadata(film: RollFilm): string[] {
  return [
    formatFilmYear(film),
    formatContentType(film),
    formatGenres(film),
    formatFilmLength(film),
  ].filter(Boolean);
}
