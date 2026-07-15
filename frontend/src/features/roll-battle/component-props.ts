import type { RollFilm } from "@/lib/api";
import type { BattleCardSide, RollBattleShareStatus } from "./domain-types";

export type RollBattleErrorStateProps = { onRetry: () => void };

export type BattleFilmProps = { film: RollFilm };

export type ChampionRailProps = {
  champion: RollFilm | null;
  completedRound: number;
};

export type BracketRailProps = {
  champion: RollFilm | null;
  roundsLeft: number;
  nextBoutLabel: string;
};

export type RoundProgressProps = { round: number };

export type BattleHeadingProps = {
  leftFilm: RollFilm;
  rightFilm: RollFilm;
  selectedFilm: RollFilm | null;
  round: number;
  reducedMotion: boolean;
};

export type FilmBattleCardProps = {
  film: RollFilm;
  onPick: () => void;
  isPicked: boolean;
  isRejected: boolean;
  side: BattleCardSide;
  reducedMotion: boolean;
};

export type BattleCardPosterProps = {
  film: RollFilm;
  isPicked: boolean;
};

export type BattleCardImageProps = { film: RollFilm };
export type BattleCardWinnerOverlayProps = { visible: boolean };
export type BattleCardAwardBadgeProps = { wins: number };
export type BattleCardRatingBadgeProps = {
  rating: number | null;
};

export type SelectedFilmAnnouncementProps = {
  film: RollFilm | null;
  reducedMotion: boolean;
};

export type BattleIntroProps = {
  leftFilm: RollFilm;
  rightFilm: RollFilm;
};

export type BattleMatchupProps = {
  leftFilm: RollFilm;
  rightFilm: RollFilm;
  pickedId: string | null;
  round: number;
  reducedMotion: boolean;
  onPick: (film: RollFilm) => void;
};

export type BattleArenaProps = BattleMatchupProps & {
  selectedFilm: RollFilm | null;
  championRailFilm: RollFilm | null;
  completedRound: number;
  roundsLeft: number;
  films: RollFilm[];
};

export type WinnerHeadingProps = {
  champion: RollFilm;
  pickedFilms: RollFilm[];
};

export type WinnerActionsProps = {
  champion: RollFilm;
  shareStatus: RollBattleShareStatus;
  onShare: () => void;
  onRestart: () => void;
};

export type WinnerResultProps = WinnerHeadingProps & {
  reducedMotion: boolean;
  shareStatus: RollBattleShareStatus;
  onShare: (film: RollFilm) => void;
  onRestart: () => void;
};
