import { filmFeatureKeys, type TasteProfileVectors } from "../../tasteProfile";
import { SCORE_DIMENSIONS } from "../constants";
import type { CandidateFilm } from "../types";
import { AWARD_REASON_PHRASES } from "./awardCopy";
import type { ReasonPart } from "./reasonPart";

export const buildMatchingReasonParts = (
  film: CandidateFilm,
  taste: TasteProfileVectors,
  topGenre: ReasonPart | null,
): ReasonPart[] => {
  const features = filmFeatureKeys(film);
  const parts = topGenreParts(topGenre);

  addDirectorPart(parts, features.director, taste);
  addAwardParts(parts, features.awards, taste);
  addDecadePart(parts, features.decade, taste);

  return parts.sort((left, right) => right.weight - left.weight);
};

const topGenreParts = (topGenre: ReasonPart | null): ReasonPart[] =>
  topGenre
    ? [{ text: `watch a lot of ${topGenre.text}`, weight: topGenre.weight }]
    : [];

const addDirectorPart = (
  parts: ReasonPart[],
  director: string | null,
  taste: TasteProfileVectors,
): void => {
  if (!director) return;

  const weight = taste.directorWeights[director] ?? 0;
  if (weight > 0) {
    parts.push({ text: `like ${director}`, weight: SCORE_DIMENSIONS.director * weight });
  }
};

const addAwardParts = (
  parts: ReasonPart[],
  awards: string[],
  taste: TasteProfileVectors,
): void => {
  for (const award of awards) {
    const text = AWARD_REASON_PHRASES[award];
    const weight = taste.awardAffinity[award] ?? 0;
    if (weight > 0 && text) {
      parts.push({ text, weight: SCORE_DIMENSIONS.award * weight });
    }
  }
};

const addDecadePart = (
  parts: ReasonPart[],
  decade: string | null,
  taste: TasteProfileVectors,
): void => {
  if (!decade) return;

  const weight = taste.decadeWeights[decade] ?? 0;
  if (weight > 0) {
    parts.push({ text: `enjoy ${decade} films`, weight: SCORE_DIMENSIONS.decade * weight });
  }
};
