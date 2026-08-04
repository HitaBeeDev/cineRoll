import { getImpressedFilmIds } from "./get-impressed-film-ids";

export function hasRecordedImpression(filmId: string): boolean {
  return getImpressedFilmIds().has(filmId);
}
