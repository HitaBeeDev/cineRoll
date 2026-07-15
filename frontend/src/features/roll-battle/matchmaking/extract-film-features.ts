import type { RollFilm } from "@/lib/api";
import type { FilmFeatures } from "./matchmaking-types";

export function extractFilmFeatures(film: RollFilm): FilmFeatures {
  const genres = new Set(film.genres.map((genre) => genre.toLowerCase()));
  return {
    year: toFiniteNumber(film.releaseYear) ?? toFiniteNumber(film.year),
    runtime: toFiniteNumber(film.runtime),
    rating: toFiniteNumber(film.imdbRating),
    genres,
    isDocumentary: genres.has("documentary"),
  };
}

function toFiniteNumber(value: unknown): number | null {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}
