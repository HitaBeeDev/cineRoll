import type { ProfileSummary } from "./domain-types";

export function mapProfileSummary(
  data: Partial<ProfileSummary>,
): ProfileSummary {
  return {
    watchlist: data.watchlist ?? 0,
    watched: data.watched ?? 0,
    hidden: data.hidden ?? 0,
    rated: data.rated ?? 0,
    favoriteGenres: data.favoriteGenres ?? [],
    genresFromRatings: data.genresFromRatings ?? false,
  };
}
