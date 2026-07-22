import type { RandomFilmRow } from "../random";
import { createPromptTokenSet } from "./localReranking/createPromptTokenSet";
import { expandSemanticTerms } from "./localReranking/expandSemanticTerms";
import { detectPromptIntent } from "./localReranking/promptIntent";
import { scoreLocalCandidate } from "./localReranking/scoreLocalCandidate";
import type { SoftPreferences } from "./softPreferences";

// Deterministic fallback that mirrors the Gemini reranking objective.
export const localRerankCandidates = (
  prompt: string,
  preferences: SoftPreferences,
  candidates: RandomFilmRow[],
  count: number,
): string[] => {
  const promptTokens = createPromptTokenSet(prompt);
  const context = {
    promptTokens,
    expandedTerms: expandSemanticTerms(promptTokens),
    promptIntent: detectPromptIntent(prompt),
  };

  return candidates
    .map(film => ({
      id: film.id,
      score: scoreLocalCandidate(film, preferences, context),
    }))
    .filter(result => Number.isFinite(result.score))
    .sort((left, right) => right.score - left.score)
    .slice(0, count)
    .map(result => result.id);
};
