import { LOCAL_SEMANTIC_KEYWORDS } from "../patterns";
import { tokenize } from "../tokenize";
import { expandSemanticTerms } from "./expandSemanticTerms";

export const scoreSoftSignals = (
  terms: string[],
  filmTokens: Set<string>,
): number => terms.reduce(
  (matches, term) => matches + (signalMatchesFilm(term, filmTokens) ? 1 : 0),
  0,
);

const signalMatchesFilm = (term: string, filmTokens: Set<string>): boolean => {
  const directMatches = LOCAL_SEMANTIC_KEYWORDS[term.toLowerCase().trim()] ?? [];
  const tokens = tokenize([term, ...directMatches].join(" "));
  const expandedTerms = expandSemanticTerms(new Set(tokens));

  return [...expandedTerms].some(token => filmTokens.has(token));
};
