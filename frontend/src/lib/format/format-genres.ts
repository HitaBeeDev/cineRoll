import { filmGenreList } from "./film-genre-list";
import { formatGenre } from "./format-genre";

/**
 * Every genre of a title, in full — "Sci-Fi · Action · Adventure". The middot is
 * the app's separator everywhere; a slash reads as a different, louder mark.
 *
 * Genres the type label already states are dropped, so an animated short reads
 * "Animated short · Drama" instead of the stuttering "Animated short ·
 * Animation · Drama".
 */
export function formatGenres(film: {
  genres?: string[] | null;
  contentType?: string | null;
  types?: string[] | null;
}): string {
  return filmGenreList(film).map(formatGenre).join(" · ");
}
