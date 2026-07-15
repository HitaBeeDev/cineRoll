import type { Film } from "@cineroll/types";

export type RollBattleWinnerProps = {
  film: Film;
};

export type RollBattleGenresProps = {
  genres: string[];
};

export type RollBattleWinnerPosterProps = {
  imageUrl: string | null;
  title: string;
};
