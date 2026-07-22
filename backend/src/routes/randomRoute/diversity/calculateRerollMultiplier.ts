import type { RandomFilmRow } from "../types";
import { getMainGenre } from "./getMainGenre";
import type { PinnedDimensions, RerollPenalty } from "./types";

const REROLL_PENALTY_STRENGTH = 0.35;

export const calculateRerollMultiplier = (
  film: RandomFilmRow,
  penalty: RerollPenalty,
  pinned: PinnedDimensions,
): number => {
  const penaltyWeight = calculatePenaltyWeight(film, penalty, pinned);

  return penaltyWeight > 0
    ? Math.exp(-REROLL_PENALTY_STRENGTH * penaltyWeight)
    : 1;
};

const calculatePenaltyWeight = (
  film: RandomFilmRow,
  penalty: RerollPenalty,
  pinned: PinnedDimensions,
): number => {
  let weight = 0;
  const genre = getMainGenre(film.genres);

  if (!pinned.genre && genre) weight += penalty.genre[genre] ?? 0;
  if (!pinned.contentType) weight += penalty.contentType[film.contentType] ?? 0;

  return weight;
};
