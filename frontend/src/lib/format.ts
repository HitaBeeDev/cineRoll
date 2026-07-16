/**
 * Year label for a title. Movies show a single year; TV series show their run as
 * a start–end range ("1966–1973"). An ongoing series (no end year) shows
 * "1966–present". Falls back to the single year when range data is absent.
 */
export function isSeriesContentType(contentType: string | null | undefined): boolean {
  return contentType === "tv-series" || contentType === "tv-mini-series";
}

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

export function formatRuntime(minutes: number | null): string {
  if (minutes == null) return "";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;

  return `${hours}h ${remainingMinutes}m`;
}

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

/** Total-episode label for a series ("269 episodes"); empty for movies. */
export function formatSeriesEpisodes(film: {
  contentType?: string | null;
  tvEpisodes?: number | null;
}): string {
  if (!isSeriesContentType(film.contentType)) return "";
  if (film.tvEpisodes == null || film.tvEpisodes < 1) return "";
  return film.tvEpisodes === 1 ? "1 episode" : `${film.tvEpisodes} episodes`;
}

const LANGUAGE_DISPLAY =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "language" })
    : null;

/**
 * Turn a raw language value into readable copy: an ISO code like "en" becomes
 * "English". Values that are already a full name (or that can't be resolved)
 * are returned untouched, so we never show a worse label than we started with.
 */
export function formatLanguage(language: string | null | undefined): string {
  if (!language) return "";
  const trimmed = language.trim();
  // Anything longer than a 3-letter code is assumed to already be a name.
  if (trimmed.length > 3) return trimmed;
  try {
    return LANGUAGE_DISPLAY?.of(trimmed.toLowerCase()) ?? trimmed;
  } catch {
    return trimmed;
  }
}
