import type { RollFilm } from "@/lib/api";

export function getAwardWinCount(film: RollFilm): number {
  return film.oscarWins + film.ggWins + film.cannesWins;
}

export function getPrimaryGenre(film: RollFilm): string {
  return film.genres[0] ?? "archive";
}

export function getDecadeLabel(film: RollFilm): string | null {
  const year = Number(film.releaseYear ?? film.year);
  if (!Number.isFinite(year)) return null;
  return `${Math.floor(year / 10) * 10}s`;
}

export function isDocumentary(film: RollFilm): boolean {
  return film.genres.some((genre) => genre.toLowerCase() === "documentary");
}
