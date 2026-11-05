/** TMDB's "where to watch" page for one title and country — every option, not just subscriptions. */
export function tmdbWatchUrl(tmdbId: number, contentType: string, country: string): string {
  const kind = contentType === "tv-series" ? "tv" : "movie";
  return `https://www.themoviedb.org/${kind}/${tmdbId}/watch?locale=${country}`;
}
