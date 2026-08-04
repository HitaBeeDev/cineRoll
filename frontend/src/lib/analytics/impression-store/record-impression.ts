import { IMPRESSED_FILM_IDS_KEY } from "@/lib/analytics/constants/impressed-film-ids-key";
import { getImpressedFilmIds } from "./get-impressed-film-ids";

export function recordImpression(filmId: string): void {
  const filmIds = getImpressedFilmIds();
  filmIds.add(filmId);
  window.sessionStorage.setItem(
    IMPRESSED_FILM_IDS_KEY,
    JSON.stringify([...filmIds]),
  );
}
