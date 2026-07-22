import type { AwardRecord, Film } from "@cineroll/types";

export type RollFilm = Pick<
  Film,
  | "id"
  | "slug"
  | "title"
  | "year"
  | "releaseYear"
  | "runtime"
  | "genres"
  | "contentType"
  | "tvSeasons"
  | "tvEpisodes"
  | "plot"
  | "director"
  | "posterUrl"
  | "posterColor"
  | "backdropUrl"
  | "imdbRating"
  | "rtScore"
  | "imdbTopMovieRank"
  | "imdbTopTvRank"
  | "oscarCategories"
  | "oscarNominations"
  | "oscarWins"
  | "ggCategories"
  | "ggNominations"
  | "ggWins"
  | "cannesCategories"
  | "cannesNominations"
  | "cannesWins"
> & {
  oscarCategories: AwardRecord[];
  ggCategories: AwardRecord[];
  cannesCategories: AwardRecord[];
};

export type BanditLane = "safe" | "gem" | "wild";
export type BetaArm = { alpha: number; beta: number };
export type LaneBandit = Record<BanditLane, BetaArm>;

export type RandomResult = {
  film: RollFilm;
  total: number;
  personalized?: boolean;
  exploration?: boolean;
  lane?: BanditLane;
  bandit?: LaneBandit;
};

export type MarathonResult = {
  films: RollFilm[];
  totalRuntime: number;
  total: number;
};

export type RerollPenalty = {
  genre: Record<string, number>;
  contentType: Record<string, number>;
};

export type BanditFeedback = { lane: BanditLane; reward: number };
