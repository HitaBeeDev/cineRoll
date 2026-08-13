import type { TasteProfileVectors } from "../../tasteProfile";
import type { CandidateFilm } from "../types";
import { buildAnchorParts } from "./buildAnchorParts";
import { buildMatchingReasonParts } from "./buildMatchingReasonParts";
import type { ReasonPart } from "./reasonPart";
import type { ReasonVariety } from "./reasonVariety";

const MAX_REASON_PHRASES = 2;
const MAX_ANCHOR_PHRASES = 1;

export const buildReasonPhrases = (
  film: CandidateFilm,
  taste: TasteProfileVectors,
  likedByGenre: Map<string, string[]>,
  topGenre: ReasonPart | null,
  variety: ReasonVariety,
): string[] => {
  const anchorParts = buildAnchorParts(film, taste, likedByGenre);
  const phrases = variety.pickPhrases(anchorParts, MAX_ANCHOR_PHRASES);

  // Slot two is whatever still distinguishes this film — director, award body
  // or decade — before falling back to the genre the row already leans on.
  const matchingParts = buildMatchingReasonParts(film, taste, topGenre);
  phrases.push(...variety.pickPhrases(matchingParts, MAX_REASON_PHRASES - phrases.length));

  return phrases;
};
