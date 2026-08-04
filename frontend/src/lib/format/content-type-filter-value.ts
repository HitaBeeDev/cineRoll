/**
 * The browse `contentType` facet value behind the label `formatContentType`
 * shows, so a link on that label returns what the label says. Mirrors the
 * precedence of `formatContentType` and returns the single type the label leads
 * with — "Documentary short" filters to documentaries, not to shorts, because
 * the facet is an OR over `types` and a two-value link would widen the result
 * past the label.
 *
 * Returns "" exactly when `formatContentType` does (a plain feature film), so
 * "has a label" and "has a link target" can never disagree.
 */
export function contentTypeFilterValue(film: {
  contentType?: string | null;
  types?: string[] | null;
}): string {
  const types = new Set(film.types?.length ? film.types : [film.contentType ?? "movie"]);

  if (types.has("tv-mini-series")) return "tv-mini-series";
  if (types.has("tv-series")) return "tv-series";
  if (types.has("documentary")) return "documentary";
  if (types.has("animation")) return "animation";
  return types.has("short") ? "short" : "";
}
