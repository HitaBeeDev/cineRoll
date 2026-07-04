import type { Difficulty, DifficultyOption } from "./types";

export const BLIND_ROLL_SCORE_KEY = "cineroll-blind-roll-score";
export const BLIND_ROLL_DIFFICULTY_KEY = "cineroll-blind-roll-difficulty";

export const DIFFICULTIES: DifficultyOption[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

export const DIFFICULTY_DESCRIPTIONS: Record<Difficulty, string> = {
  easy: "Easy · 4 suspects · decade and genre clues",
  medium: "Medium · 4 suspects · award trail and decade clue",
  hard: "Hard · 4 suspects · award trail only",
};
