import { Prisma } from "@prisma/client";

import { candidateSelect } from "./select";

export type CandidateFilm = Prisma.FilmGetPayload<{ select: typeof candidateSelect }>;

export type Scored = {
  film: CandidateFilm;
  score: number;
};

export type Recommendation = {
  id: string;
  slug: string;
  title: string;
  year: number;
  posterUrl: string | null;
  genres: string[];
  director: string | null;
  imdbRating: number | null;
  rtScore: number | null;
  score: number;
  reason: string;
};

export type RecommendationResult =
  | { code: "NOT_ENOUGH_DATA"; modelVersion: string }
  | {
      modelVersion: string;
      coldStart: boolean;
      variant: string;
      recommendations: Recommendation[];
    };
