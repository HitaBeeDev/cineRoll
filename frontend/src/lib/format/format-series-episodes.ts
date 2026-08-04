import { isSeriesContentType } from "./is-series-content-type";

/** Total-episode label for a series ("269 episodes"); empty for movies. */
export function formatSeriesEpisodes(film: {
  contentType?: string | null;
  tvEpisodes?: number | null;
}): string {
  if (!isSeriesContentType(film.contentType)) return "";
  if (film.tvEpisodes == null || film.tvEpisodes < 1) return "";
  return film.tvEpisodes === 1 ? "1 episode" : `${film.tvEpisodes} episodes`;
}
