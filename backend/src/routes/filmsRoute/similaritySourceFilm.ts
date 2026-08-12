export type SimilaritySourceFilm = {
  id: string;
  director: string | null;
  genres: string[];
  // The axis that used to be missing entirely. Without it a film's neighbours
  // were ranked by IMDb alone once they tied on genre, and prestige TV outrates
  // almost every film ever made — so every drama surfaced Chernobyl.
  contentType: string;
  releaseYear: number;
  originCountries: string[];
  language: string | null;
  /** Billed cast, JSON — read through `extractLeadCastIds`. */
  cast: unknown;
  oscarCategories: unknown;
  ggCategories: unknown;
  cannesCategories: unknown;
};
