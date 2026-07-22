import { LOCAL_SEMANTIC_KEYWORDS } from "../patterns";

export const expandSemanticTerms = (terms: Set<string>): Set<string> => {
  const expandedTerms = new Set(terms);

  for (const [term, keywords] of Object.entries(LOCAL_SEMANTIC_KEYWORDS)) {
    if (terms.has(term)) {
      for (const keyword of keywords) expandedTerms.add(keyword);
    }
  }

  return expandedTerms;
};
