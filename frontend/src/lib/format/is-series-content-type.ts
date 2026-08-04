/**
 * Year label for a title. Movies show a single year; TV series show their run as
 * a start–end range ("1966–1973"). An ongoing series (no end year) shows
 * "1966–present". Falls back to the single year when range data is absent.
 */
export function isSeriesContentType(contentType: string | null | undefined): boolean {
  return contentType === "tv-series" || contentType === "tv-mini-series";
}
