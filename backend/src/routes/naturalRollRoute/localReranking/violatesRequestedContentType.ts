import type { RandomFilmRow } from "../../random";

// Only the movie/series axis belongs here; finer content types are SQL filters.
export const violatesRequestedContentType = (
  film: RandomFilmRow,
  requestedContentType: string | null,
): boolean => {
  if (requestedContentType === "movie") return film.contentType === "tv-series";
  if (requestedContentType === "tv-series") return film.contentType !== "tv-series";

  return false;
};
