import type { Film } from "@cineroll/types";
import type { RollFilm } from "@/lib/api";

export type RollBattleWinnerProps = {
  film: RollFilm;
  emptyAwardsLabel?: string;
};

export type RollBattleGenresProps = {
  genres: string[];
};

export type RollBattleWinnerPosterProps = {
  imageUrl: string | null;
  title: string;
};

export type RollBattleResultActionsProps = {
  film: Film;
};
