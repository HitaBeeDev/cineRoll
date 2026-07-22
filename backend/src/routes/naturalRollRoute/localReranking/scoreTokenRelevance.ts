import { LOCAL_RERANK_WEIGHTS } from "./weights";

export const scoreTokenRelevance = (
  filmTokens: Set<string>,
  promptTokens: Set<string>,
  expandedTerms: Set<string>,
): number => {
  let score = 0;

  for (const token of filmTokens) {
    if (promptTokens.has(token)) score += LOCAL_RERANK_WEIGHTS.promptToken;
    else if (expandedTerms.has(token)) score += LOCAL_RERANK_WEIGHTS.expandedToken;
  }

  return score;
};
