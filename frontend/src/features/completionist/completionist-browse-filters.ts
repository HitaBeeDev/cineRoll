import type { CompletionCategoryKey } from "@cineroll/types";

export const COMPLETIONIST_BROWSE_FILTERS: Record<
  CompletionCategoryKey,
  string
> = {
  oscar: "awardBody=oscar",
  goldenglobe: "awardBody=goldenglobe",
  cannes: "awardBody=cannes",
  berlin: "awardBody=berlin",
  "imdb-movies": "imdbTopMoviesOnly=true",
  "imdb-tv": "imdbTopTvOnly=true",
};
