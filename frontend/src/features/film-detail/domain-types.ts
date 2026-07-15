import type { AwardRecord } from "@cineroll/types";

export type SimilarFilm = {
  id: string;
  slug: string;
  title: string;
  year: number;
  releaseYear: number;
  genres: string[];
  contentType: string;
  director: string | null;
  posterUrl: string | null;
  posterColor: string | null;
  imdbRating: number | null;
  imdbTopMovieRank: number | null;
  imdbTopTvRank: number | null;
  certificate: string | null;
  tvType: string | null;
  tvStartYear: number | null;
  tvEndYear: number | null;
  oscarWins: number;
  oscarNominations: number;
  ggWins: number;
  ggNominations: number;
  cannesWins: number;
  cannesNominations: number;
};

export type CeremonySummary = {
  title: string;
  code: string;
  shortLabel: string;
  icon: "oscar" | "globe" | "cannes";
  wins: number;
  nominations: number;
  records: AwardRecord[];
};

export type AwardSummary = {
  totalWins: number;
  totalNominations: number;
  ceremonies: CeremonySummary[];
};

export type HeroImage = {
  isPoster: boolean;
  size: "w780" | "w1280";
  url: string | null;
  scrim: string;
};
