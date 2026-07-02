import { Prisma } from "@prisma/client";

export type RandomFilmRow = {
  id: string;
  slug: string;
  title: string;
  originalTitle: string | null;
  releaseYear: number;
  year: number;
  runtime: number | null;
  genres: string[];
  contentType: string;
  plot: string | null;
  director: string | null;
  posterUrl: string | null;
  posterColor: string | null;
  backdropUrl: string | null;
  imdbRating: number | null;
  rtScore: number | null;
  imdbTopMovieRank: number | null;
  imdbTopTvRank: number | null;
  oscarCategories: Prisma.JsonValue;
  oscarNominations: number;
  oscarWins: number;
  ggCategories: Prisma.JsonValue;
  ggNominations: number;
  ggWins: number;
  cannesCategories: Prisma.JsonValue;
  cannesNominations: number;
  cannesWins: number;
  berlinCategories: Prisma.JsonValue;
  berlinNominations: number;
  berlinWins: number;
};

export type RandomFilmResult = {
  film: RandomFilmRow | null;
  total: number;
  // Which bandit lane was drawn for this roll (Safe / Gem / Wild), so the client
  // can credit engagement back to the right arm. Absent on deterministic seed
  // rolls, which don't draw a lane.
  lane?: "safe" | "gem" | "wild";
};

export type PersonalizedRandomFilmResult = RandomFilmResult & {
  exploration: boolean;
};
