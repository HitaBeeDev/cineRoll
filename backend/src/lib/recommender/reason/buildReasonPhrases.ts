import type { TasteProfileVectors } from "../../tasteProfile";
import type { CandidateFilm } from "../types";
import { buildMatchingReasonParts } from "./buildMatchingReasonParts";
import type { ReasonPart } from "./reasonPart";

const MAX_REASON_PHRASES = 2;

export const buildReasonPhrases = (
  film: CandidateFilm,
  taste: TasteProfileVectors,
  likedByGenre: Map<string, string>,
  topGenre: ReasonPart | null,
): string[] => {
  const phrases: string[] = [];
  const anchorTitle = topGenre ? likedByGenre.get(topGenre.text) : undefined;

  if (anchorTitle) phrases.push(`liked ${anchorTitle}`);

  const matchingParts = buildMatchingReasonParts(film, taste, topGenre);
  const availableSlots = MAX_REASON_PHRASES - phrases.length;
  phrases.push(...matchingParts.slice(0, availableSlots).map(part => part.text));

  return phrases;
};
