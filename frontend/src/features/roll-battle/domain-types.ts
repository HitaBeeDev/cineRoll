import type { RollFilm } from "@/lib/api";

export type RollBattlePhase = "loading" | "battling" | "result" | "error";
export type RollBattleShareStatus = "idle" | "copied";
export type BattleCardSide = "left" | "right";

export type RollBattleState = {
  films: RollFilm[];
  round: number;
  champion: RollFilm | null;
  phase: RollBattlePhase;
  pickedId: string | null;
  pickedFilms: RollFilm[];
};

export type RollBattleView = {
  leftFilm: RollFilm | null;
  rightFilm: RollFilm | null;
  selectedFilm: RollFilm | null;
  championRailFilm: RollFilm | null;
  completedRound: number;
  roundsLeft: number;
};

export type RollBattleAction =
  | { type: "loading_started" }
  | { type: "pool_loaded"; films: RollFilm[] }
  | { type: "pool_failed" }
  | { type: "film_picked"; film: RollFilm }
  | { type: "round_advanced"; champion: RollFilm }
  | { type: "battle_completed"; champion: RollFilm };

export type RollBattleController = RollBattleState &
  RollBattleView & {
    loadBattle: () => Promise<void>;
    pickFilm: (film: RollFilm) => void;
  };

export type RollBattleShareController = {
  status: RollBattleShareStatus;
  shareWinner: (film: RollFilm) => Promise<void>;
  resetShareStatus: () => void;
};
