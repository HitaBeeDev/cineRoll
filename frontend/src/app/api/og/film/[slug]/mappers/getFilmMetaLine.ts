import type { Film } from "@cineroll/types";

export function getFilmMetaLine(film: Film): string {
  return [
    film.year ? String(film.year) : null,
    film.director,
    film.runtime ? `${film.runtime} min` : null,
  ]
    .filter((part): part is string => Boolean(part))
    .join("   ·   ");
}
