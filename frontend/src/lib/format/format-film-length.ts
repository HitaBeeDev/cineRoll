import { formatRuntime } from "./format-runtime";
import { isSeriesContentType } from "./is-series-content-type";

/**
 * Length label for a title: movies show runtime ("2h 45m"), series show their
 * season count ("11 seasons") — a series' runtime is per-episode noise, never
 * shown anywhere in the product. A series without season data shows nothing.
 */
export function formatFilmLength(film: {
  contentType?: string | null;
  runtime?: number | null;
  tvSeasons?: number | null;
}): string {
  if (!isSeriesContentType(film.contentType)) return formatRuntime(film.runtime ?? null);
  if (film.tvSeasons == null || film.tvSeasons < 1) return "";
  return film.tvSeasons === 1 ? "1 season" : `${film.tvSeasons} seasons`;
}
