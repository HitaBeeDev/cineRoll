import { IMPRESSED_FILM_IDS_KEY } from "@/lib/analytics/constants/impressed-film-ids-key";
import { cachedFilmIds } from "./cached-film-ids";

export function clearRecordedImpressions(): void {
  cachedFilmIds.value = null;
  window.sessionStorage.removeItem(IMPRESSED_FILM_IDS_KEY);
}
