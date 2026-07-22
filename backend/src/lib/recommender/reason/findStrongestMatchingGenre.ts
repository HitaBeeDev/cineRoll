import { filmFeatureKeys, type TasteProfileVectors } from "../../tasteProfile";
import type { CandidateFilm } from "../types";
import type { ReasonPart } from "./reasonPart";

export const findStrongestMatchingGenre = (
  film: CandidateFilm,
  taste: TasteProfileVectors,
): ReasonPart | null => {
  let strongest: ReasonPart | null = null;

  for (const genre of filmFeatureKeys(film).genres) {
    const weight = taste.genreWeights[genre] ?? 0;
    if (weight > (strongest?.weight ?? 0)) {
      strongest = { text: genre, weight };
    }
  }

  return strongest;
};
