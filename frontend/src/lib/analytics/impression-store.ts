import { IMPRESSED_FILM_IDS_KEY } from "./constants";

let cachedFilmIds: Set<string> | null = null;

export function hasRecordedImpression(filmId: string): boolean {
  return getImpressedFilmIds().has(filmId);
}

export function recordImpression(filmId: string): void {
  const filmIds = getImpressedFilmIds();
  filmIds.add(filmId);
  window.sessionStorage.setItem(
    IMPRESSED_FILM_IDS_KEY,
    JSON.stringify([...filmIds]),
  );
}

export function clearRecordedImpressions(): void {
  cachedFilmIds = null;
  window.sessionStorage.removeItem(IMPRESSED_FILM_IDS_KEY);
}

function getImpressedFilmIds(): Set<string> {
  if (cachedFilmIds) return cachedFilmIds;

  const rawFilmIds = window.sessionStorage.getItem(IMPRESSED_FILM_IDS_KEY);
  const parsedFilmIds = rawFilmIds ? (JSON.parse(rawFilmIds) as unknown) : [];
  const validFilmIds = Array.isArray(parsedFilmIds)
    ? parsedFilmIds.filter((id): id is string => typeof id === "string")
    : [];

  cachedFilmIds = new Set(validFilmIds);
  return cachedFilmIds;
}
