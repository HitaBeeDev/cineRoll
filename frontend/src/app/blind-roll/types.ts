import type { AwardRecord } from "@cineroll/types";
import type { RollFilm } from "@/lib/api";

export type Phase = "loading" | "ready" | "revealed" | "error";
export type Difficulty = "easy" | "medium" | "hard";
export type ShareStatus = "idle" | "copied" | "failed";

export type BlindRound = {
  film: RollFilm;
  options: RollFilm[];
};

export type SessionScore = {
  correct: number;
  total: number;
};

export type DifficultyOption = {
  value: Difficulty;
  label: string;
};

export type ClueCard = {
  label: string;
  value: string;
};

export type AwardSummary = {
  bodies: string;
  yearTrail: string;
  count: number;
  status: string;
};

export type BlindRollAward = AwardRecord;
