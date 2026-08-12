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
  | "types"
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

/**
 * What became of a draw. `engaged` — the user acted on it (details, save,
 * seen); `rejected` — "not interested"; `passed` — rolled on without touching
 * it. The same three the reroll penalty already distinguishes by strength.
 */
export type RollOutcome = "engaged" | "rejected" | "passed";

/** The draw a roll follows, and how that one ended. */
export type ParentDraw = { drawId: string; outcome: RollOutcome };

export type RandomResult = {
  film: RollFilm;
  total: number;
  /**
   * This draw's identity on the server. The next roll cites it as its parent,
   * which is what makes a session's draws a chain instead of a pile. Absent on
   * seeded (daily-pick) rolls, which belong to no one's session.
   */
  drawId?: string | null;
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
