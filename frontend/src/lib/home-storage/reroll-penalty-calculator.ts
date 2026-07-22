import type { RerollPenalty, RollFilm } from "@/lib/api";
import {
  REROLL_DECAY,
  REROLL_MAX_PENALTY,
  REROLL_MIN_PENALTY,
  REROLL_STRONG_PENALTY,
  REROLL_WEAK_PENALTY,
} from "./reroll-penalty-constants";

export function createEmptyRerollPenalty(): RerollPenalty {
  return { genre: {}, contentType: {} };
}

export function sanitizeRerollPenalty(value: unknown): RerollPenalty {
  if (!value || typeof value !== "object") return createEmptyRerollPenalty();
  const penalty = value as Partial<RerollPenalty>;
  return {
    genre: sanitizeWeights(penalty.genre),
    contentType: sanitizeWeights(penalty.contentType),
  };
}

export function decayRerollPenalty(penalty: RerollPenalty): RerollPenalty {
  return {
    genre: decayWeights(penalty.genre),
    contentType: decayWeights(penalty.contentType),
  };
}

export function applyFilmRerollPenalty(
  penalty: RerollPenalty,
  film: RollFilm,
  strength: "weak" | "strong",
): RerollPenalty {
  const amount = getPenaltyAmount(strength);
  const genre = film.genres[0];
  const genreWeights = { ...penalty.genre };
  const contentTypeWeights = { ...penalty.contentType };
  if (genre) genreWeights[genre] = addWeight(genreWeights[genre], amount);
  if (film.contentType) {
    contentTypeWeights[film.contentType] = addWeight(
      contentTypeWeights[film.contentType],
      amount,
    );
  }
  return { genre: genreWeights, contentType: contentTypeWeights };
}

function sanitizeWeights(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, number] => {
      const weight = entry[1];
      return typeof weight === "number" && Number.isFinite(weight) && weight > 0;
    }),
  );
}

function decayWeights(weights: Record<string, number>): Record<string, number> {
  const decayedEntries = Object.entries(weights)
    .map(([key, weight]) => [key, weight * REROLL_DECAY] as const)
    .filter(([, weight]) => weight >= REROLL_MIN_PENALTY);
  return Object.fromEntries(decayedEntries);
}

function getPenaltyAmount(strength: "weak" | "strong"): number {
  return strength === "strong" ? REROLL_STRONG_PENALTY : REROLL_WEAK_PENALTY;
}

function addWeight(currentWeight: number | undefined, amount: number): number {
  return Math.min((currentWeight ?? 0) + amount, REROLL_MAX_PENALTY);
}
