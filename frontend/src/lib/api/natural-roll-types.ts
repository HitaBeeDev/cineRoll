import type { RollFilm } from "./roll-types";

export type NaturalRollFilters = {
  search?: string;
  person?: string;
  director?: string;
  femaleDirectorOnly?: boolean;
  awardBody?: string;
  winnerOnly?: boolean;
  nominatedOnly?: boolean;
  category?: string;
  awardYear?: number;
  language?: string;
  genre?: string | string[];
  genreAll?: string[];
  country?: string;
  contentType?: string;
  yearMin?: number;
  yearMax?: number;
  runtimeMax?: number;
  imdbRatingMin?: number;
  rtScoreMin?: number;
  imdbTopMoviesOnly?: boolean;
  imdbTopTvOnly?: boolean;
  tvType?: string;
  certificate?: string;
};

export type NaturalRollResult = {
  films: RollFilm[];
  total: number;
  interpretedFilters: NaturalRollFilters;
  relaxed: boolean;
};

export type NaturalRollInterpreted = {
  interpretedFilters: NaturalRollFilters;
  relaxed: boolean;
  total: number;
  resultCount?: number;
  /** What a named reference film ("similar to X") was read as, or why one
   *  couldn't be used. Null when the request named none. */
  referenceNote?: string | null;
  /** Nothing in the request gave the ranker anything to work with, so the picks
   *  are the quality fallback rather than a match. */
  lowConfidence?: boolean;
};

export type NaturalRollError = Error & {
  code: string;
  interpretedFilters?: NaturalRollFilters;
};

export type NaturalRollEvent =
  | ({ type: "interpreted" } & NaturalRollInterpreted)
  | ({ type: "result" } & NaturalRollResult)
  | {
      type: "error";
      error?: string;
      code?: string;
      interpretedFilters?: NaturalRollFilters;
    };
