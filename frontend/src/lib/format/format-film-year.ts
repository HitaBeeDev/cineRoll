import { isSeriesContentType } from "./is-series-content-type";

export function formatFilmYear(film: {
  contentType?: string | null;
  year?: number | null;
  releaseYear?: number | null;
  tvStartYear?: number | null;
  tvEndYear?: number | null;
}): string {
  const single = film.year ?? film.releaseYear ?? null;
  const isSeries = isSeriesContentType(film.contentType);
  if (!isSeries) return single != null ? String(single) : "";

  // A "tv-series" with neither a start nor an end year isn't really an ongoing
  // run — it's usually a TV movie TMDB catalogs under /tv (e.g. "Hope" 1997). Show
  // the single year rather than falsely claiming "1997–present".
  if (film.tvStartYear == null && film.tvEndYear == null) {
    return single != null ? String(single) : "";
  }

  const start = film.tvStartYear ?? single;
  if (start == null) return "";
  const end = film.tvEndYear;
  if (end == null) return film.contentType === "tv-mini-series" ? String(start) : `${start}–present`;
  return end === start ? String(start) : `${start}–${end}`;
}
