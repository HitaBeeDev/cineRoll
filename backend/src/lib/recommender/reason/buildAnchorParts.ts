import { filmFeatureKeys, type TasteProfileVectors } from "../../tasteProfile";
import type { CandidateFilm } from "../types";
import type { ReasonPart } from "./reasonPart";

/**
 * Every liked title that shares a genre with this film, strongest genre first.
 * Anchoring on the top genre alone leaves a single candidate per film; taking
 * all shared genres gives the variety picker something to rotate through.
 */
export const buildAnchorParts = (
  film: CandidateFilm,
  taste: TasteProfileVectors,
  likedByGenre: Map<string, string[]>,
): ReasonPart[] => {
  const parts: ReasonPart[] = [];
  const seenTitles = new Set<string>();

  for (const { genre, weight } of sharedGenresByWeight(film, taste)) {
    for (const title of likedByGenre.get(genre) ?? []) {
      if (seenTitles.has(title)) continue;

      seenTitles.add(title);
      parts.push({ text: `liked ${title}`, weight });
    }
  }

  return parts;
};

const sharedGenresByWeight = (
  film: CandidateFilm,
  taste: TasteProfileVectors,
): { genre: string; weight: number }[] =>
  filmFeatureKeys(film)
    .genres.map(genre => ({ genre, weight: taste.genreWeights[genre] ?? 0 }))
    .filter(({ weight }) => weight > 0)
    .sort((left, right) => right.weight - left.weight);
