import { FilmSummary } from "./selects";

export function withYear(film: FilmSummary) {
  return { ...film, year: film.releaseYear };
}

export function paginatedFilmEntries<T extends { id: string; film: FilmSummary }>(
  entries: T[],
  limit: number,
) {
  const hasMore = entries.length > limit;
  const page = hasMore ? entries.slice(0, limit) : entries;

  return {
    page,
    nextCursor: hasMore ? page[page.length - 1]!.id : null,
  };
}

export function mapEntryFilm<T extends { film: FilmSummary }>(entry: T) {
  const { film, ...rest } = entry;

  return { ...rest, film: withYear(film) };
}
