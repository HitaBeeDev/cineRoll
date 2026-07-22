import type { TasteCardFilm } from "@/lib/api";
import type { TasteSeed } from "./onboarding-storage-types";

export function createTasteSeed(
  films: TasteCardFilm[],
  selectedFilmIds: string[],
): TasteSeed | null {
  if (selectedFilmIds.length === 0) return null;

  const selectedFilms = selectFilms(films, selectedFilmIds);
  if (selectedFilms.length === 0) return null;

  const genres = rankGenres(selectedFilms);
  return {
    source: "onboarding",
    filmIds: selectedFilmIds,
    genres,
    primaryGenre: genres[0] ?? null,
    createdAt: new Date().toISOString(),
  };
}

function selectFilms(
  films: TasteCardFilm[],
  selectedFilmIds: string[],
): TasteCardFilm[] {
  const selectedIds = new Set(selectedFilmIds);
  return films.filter((film) => selectedIds.has(film.id));
}

function rankGenres(films: TasteCardFilm[]): string[] {
  const counts = new Map<string, number>();
  for (const film of films) {
    for (const genre of film.genres) {
      counts.set(genre, (counts.get(genre) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort(([genreA, countA], [genreB, countB]) => {
      return countB - countA || genreA.localeCompare(genreB);
    })
    .map(([genre]) => genre);
}
