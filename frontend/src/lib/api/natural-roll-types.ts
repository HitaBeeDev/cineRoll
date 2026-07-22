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
  decadeMin?: number;
  decadeMax?: number;
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
