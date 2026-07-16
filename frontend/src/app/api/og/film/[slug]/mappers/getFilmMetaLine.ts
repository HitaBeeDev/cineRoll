import type { Film } from "@cineroll/types";
import { formatFilmLength } from "@/lib/format";

export function getFilmMetaLine(film: Film): string {
  return [
    film.year ? String(film.year) : null,
    film.director,
    formatFilmLength(film) || null,
  ]
    .filter((part): part is string => Boolean(part))
    .join("   ·   ");
}
