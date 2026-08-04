/**
 * What KIND of title this is, in one phrase — "Short", "Documentary",
 * "Animated short", "TV Series".
 *
 * Reads the derived `types` set rather than the single-valued `contentType`,
 * because a title is often several things at once (a 9-minute war documentary
 * is documentary AND short) and `types` is the set the browse facets already
 * filter on. Falls back to `contentType` for payloads that predate it.
 *
 * A plain feature film returns "" on purpose: its runtime already says "movie",
 * so labelling ~90% of the catalogue "Movie" would be noise. Only the things a
 * viewer would be surprised by get named.
 */
export function formatContentType(film: {
  contentType?: string | null;
  types?: string[] | null;
}): string {
  const types = new Set(film.types?.length ? film.types : [film.contentType ?? "movie"]);

  if (types.has("tv-mini-series")) return "Mini-Series";
  if (types.has("tv-series")) return "TV Series";

  const isShort = types.has("short");
  if (types.has("documentary")) return isShort ? "Documentary short" : "Documentary";
  if (types.has("animation")) return isShort ? "Animated short" : "Animation";
  return isShort ? "Short" : "";
}
