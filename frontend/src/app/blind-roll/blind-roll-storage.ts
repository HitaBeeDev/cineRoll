import { BLIND_ROLL_DIFFICULTY_KEY, BLIND_ROLL_SCORE_KEY } from "./constants";
import type { Difficulty, SessionScore } from "./types";

const DEFAULT_SCORE: SessionScore = { correct: 0, total: 0 };
const DEFAULT_DIFFICULTY: Difficulty = "medium";

export function readSessionScore(): SessionScore {
  if (typeof window === "undefined") return DEFAULT_SCORE;

  try {
    const parsed = parseStoredScore(window.sessionStorage.getItem(BLIND_ROLL_SCORE_KEY));
    return parsed ?? DEFAULT_SCORE;
  } catch {
    return DEFAULT_SCORE;
  }
}

export function writeSessionScore(score: SessionScore) {
  try {
    window.sessionStorage.setItem(BLIND_ROLL_SCORE_KEY, JSON.stringify(score));
  } catch {}
}

export function readDifficulty(): Difficulty {
  if (typeof window === "undefined") return DEFAULT_DIFFICULTY;

  try {
    return getUrlDifficulty() ?? getStoredDifficulty() ?? DEFAULT_DIFFICULTY;
  } catch {
    return DEFAULT_DIFFICULTY;
  }
}

export function writeDifficulty(difficulty: Difficulty) {
  try {
    window.sessionStorage.setItem(BLIND_ROLL_DIFFICULTY_KEY, difficulty);
  } catch {}
}

function parseStoredScore(raw: string | null): SessionScore | null {
  const parsed: unknown = raw ? JSON.parse(raw) : null;

  if (
    parsed &&
    typeof parsed === "object" &&
    "correct" in parsed &&
    "total" in parsed &&
    typeof parsed.correct === "number" &&
    typeof parsed.total === "number"
  ) {
    return {
      correct: Math.max(0, parsed.correct),
      total: Math.max(0, parsed.total),
    };
  }

  return null;
}

function getUrlDifficulty(): Difficulty | null {
  return parseDifficulty(new URLSearchParams(window.location.search).get("difficulty"));
}

function getStoredDifficulty(): Difficulty | null {
  return parseDifficulty(window.sessionStorage.getItem(BLIND_ROLL_DIFFICULTY_KEY));
}

function parseDifficulty(value: string | null): Difficulty | null {
  if (value === "easy" || value === "medium" || value === "hard") return value;
  return null;
}
