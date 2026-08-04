import { IMPRESSED_FILM_IDS_KEY } from "@/lib/analytics/constants/impressed-film-ids-key";
import { cachedFilmIds } from "./cached-film-ids";

export function getImpressedFilmIds(): Set<string> {
  if (cachedFilmIds.value) return cachedFilmIds.value;

  const rawFilmIds = window.sessionStorage.getItem(IMPRESSED_FILM_IDS_KEY);
  const parsedFilmIds = rawFilmIds ? (JSON.parse(rawFilmIds) as unknown) : [];
  const validFilmIds = Array.isArray(parsedFilmIds)
    ? parsedFilmIds.filter((id): id is string => typeof id === "string")
    : [];

  cachedFilmIds.value = new Set(validFilmIds);
  return cachedFilmIds.value;
}
