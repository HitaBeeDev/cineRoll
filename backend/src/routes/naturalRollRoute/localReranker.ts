import { RandomFilmRow } from "../random";
import { LOCAL_SEMANTIC_KEYWORDS } from "./patterns";
import { tokenize } from "./tokenize";

export function localRerankCandidates(
  prompt: string,
  candidates: RandomFilmRow[],
  count: number,
): string[] {
  const promptTokens = promptTokenSet(prompt);
  const expandedTerms = expandPromptTerms(promptTokens);
  const preferences = promptPreferences(prompt);

  return candidates
    .map(film => ({ id: film.id, score: scoreCandidate(film, promptTokens, expandedTerms, preferences) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(result => result.id);
}

function promptTokenSet(prompt: string): Set<string> {
  return new Set(tokenize(prompt).filter(token => token.length > 2));
}

function expandPromptTerms(promptTokens: Set<string>): Set<string> {
  const expandedTerms = new Set(promptTokens);

  for (const [term, keywords] of Object.entries(LOCAL_SEMANTIC_KEYWORDS)) {
    if (promptTokens.has(term)) keywords.forEach(keyword => expandedTerms.add(keyword));
  }

  return expandedTerms;
}

function promptPreferences(prompt: string) {
  return {
    rejectsGore: /\b(rather than gore|not gore|no gore|less gore)\b/i.test(prompt),
    wantsUnderrated: /\b(underrated|hidden gem|obscure|overlooked)\b/i.test(prompt),
  };
}

function scoreCandidate(
  film: RandomFilmRow,
  promptTokens: Set<string>,
  expandedTerms: Set<string>,
  preferences: ReturnType<typeof promptPreferences>,
): number {
  const haystack = filmTokens(film);
  let score = tokenScore(haystack, promptTokens, expandedTerms);

  if (film.imdbRating != null) score += film.imdbRating / 2;
  if (preferences.wantsUnderrated && !film.imdbTopMovieRank && !film.imdbTopTvRank) score += 2;
  if (preferences.rejectsGore && containsGoreToken(haystack)) score -= 5;

  return score;
}

function tokenScore(
  haystack: string[],
  promptTokens: Set<string>,
  expandedTerms: Set<string>,
): number {
  return haystack.reduce((score, token) => {
    if (promptTokens.has(token)) score += 3;
    if (expandedTerms.has(token)) score += 1;
    return score;
  }, 0);
}

function filmTokens(film: RandomFilmRow): string[] {
  return tokenize([
    film.title,
    film.originalTitle,
    film.year,
    film.genres.join(" "),
    film.director,
    film.plot,
  ].filter(Boolean).join(" "));
}

function containsGoreToken(tokens: string[]): boolean {
  return tokens.some(token => ["gore", "bloody", "blood", "slasher"].includes(token));
}
