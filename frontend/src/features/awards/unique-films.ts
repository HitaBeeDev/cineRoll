import type { AwardEntry, AwardFilm } from "./award-types";

/** Each film once, in the order the page shows it. */
export function uniqueFilms(entries: AwardEntry[]): AwardFilm[] {
  const seen = new Map<string, AwardFilm>();
  for (const { film } of entries) if (!seen.has(film.slug)) seen.set(film.slug, film);
  return [...seen.values()];
}
