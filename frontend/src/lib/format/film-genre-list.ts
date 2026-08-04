import { formatContentType } from "./format-content-type";

/** The genres of `formatGenres`, unjoined — for chip/tag rows. */
export function filmGenreList(film: {
  genres?: string[] | null;
  contentType?: string | null;
  types?: string[] | null;
}): string[] {
  const stated = new Set<string>();
  const contentType = formatContentType(film);
  if (contentType.startsWith("Animated") || contentType === "Animation") stated.add("Animation");
  if (contentType.startsWith("Documentary")) stated.add("Documentary");

  return (film.genres ?? []).filter((genre) => !stated.has(genre));
}
