export type AwardBody = "oscar" | "goldenglobe" | "cannes";

export type SnobTestFilmRow = {
  id: string;
  slug: string;
  title: string;
  originalTitle: string | null;
  releaseYear: number;
  year: number;
  genres: string[];
  posterUrl: string | null;
  posterColor: string | null;
  imdbRating: number | null;
  imdbTopMovieRank: number | null;
  imdbTopTvRank: number | null;
  decade: number;
  awardBodies: AwardBody[];
  oscarNominations: number;
  oscarWins: number;
  ggNominations: number;
  ggWins: number;
  cannesNominations: number;
  cannesWins: number;
  berlinNominations: number;
  berlinWins: number;
};

export type ScoreFilmRow = {
  id: string;
  releaseYear: number;
  decade: number;
  awardBodies: AwardBody[];
  // Difficulty signals for the IRT score (irt.ts / docs/algorithms.md §7).
  imdbRating: number | null;
  imdbTopMovieRank: number | null;
  imdbTopTvRank: number | null;
  oscarWins: number;
  ggWins: number;
  cannesWins: number;
  oscarNominations: number;
  ggNominations: number;
  cannesNominations: number;
  posterUrl: string | null;
};

export type BreakdownBucket = {
  seen: number;
  total: number;
};
