import type { TasteProfileVectors } from "../tasteProfile";
import { buildColdStartReason } from "./reason/buildColdStartReason";
import { buildFallbackReason } from "./reason/buildFallbackReason";
import { buildReasonPhrases } from "./reason/buildReasonPhrases";
import { findStrongestMatchingGenre } from "./reason/findStrongestMatchingGenre";
import type { ReasonVariety } from "./reason/reasonVariety";
import type { CandidateFilm } from "./types";

export function buildReason(
  film: CandidateFilm,
  taste: TasteProfileVectors,
  likedByGenre: Map<string, string[]>,
  coldStart: boolean,
  index: number,
  variety: ReasonVariety,
): string {
  const topGenre = findStrongestMatchingGenre(film, taste);

  if (coldStart) {
    return buildColdStartReason(film, topGenre?.text ?? null, index);
  }

  const phrases = buildReasonPhrases(film, taste, likedByGenre, topGenre, variety);

  return phrases.length > 0
    ? `Because you ${phrases.join(" and ")}.`
    : buildFallbackReason(film);
}
