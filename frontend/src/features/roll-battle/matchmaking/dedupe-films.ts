import type { RollFilm } from "@/lib/api";

export function dedupeFilms(films: RollFilm[]): RollFilm[] {
  const seenIds = new Set<string>();
  return films.filter((film) => {
    if (seenIds.has(film.id)) return false;
    seenIds.add(film.id);
    return true;
  });
}
