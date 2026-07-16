import { RandomFilmRow } from "../random";
import { LOCAL_SEMANTIC_KEYWORDS } from "./patterns";
import { SoftPreferences } from "./softPreferences";
import { tokenize } from "./tokenize";

// Deterministic fallback for the rerank step. It must optimize the SAME
// objective as the Gemini path (see rerankPrompt.ts) so the ordering doesn't
// swing depending on whether Gemini is available. The objective, in order of
// weight: content-type guard (movie vs series is absolute), requested genres,
// tones, themes, craft keywords, textual relevance, and only then the IMDb
// rating as a weak tie-breaker — a famous title must never outrank a film
// that actually matches the request.
const WEIGHTS = {
  genreMatch: 4,
  genreMissing: -8,
  tone: 3,
  theme: 2.5,
  keyword: 2,
  promptToken: 1.5,
  expandedToken: 0.5,
} as const;

export function localRerankCandidates(
  prompt: string,
  preferences: SoftPreferences,
  candidates: RandomFilmRow[],
  count: number,
): string[] {
  const promptTokens = promptTokenSet(prompt);
  const expandedTerms = expandTerms(promptTokens);
  const promptFlags = promptPreferences(prompt);

  return candidates
    .map(film => ({
      id: film.id,
      score: scoreCandidate(film, preferences, promptTokens, expandedTerms, promptFlags),
    }))
    .filter(result => Number.isFinite(result.score))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(result => result.id);
}

function scoreCandidate(
  film: RandomFilmRow,
  preferences: SoftPreferences,
  promptTokens: Set<string>,
  expandedTerms: Set<string>,
  promptFlags: ReturnType<typeof promptPreferences>,
): number {
  if (violatesContentType(film, preferences.contentType)) return -Infinity;

  const filmTokenSet = new Set(filmTokens(film));

  let score = genreScore(film, preferences.genres);
  score += softSignalScore(preferences.tones, filmTokenSet) * WEIGHTS.tone;
  score += softSignalScore(preferences.themes, filmTokenSet) * WEIGHTS.theme;
  score += softSignalScore(preferences.keywords, filmTokenSet) * WEIGHTS.keyword;
  score += tokenScore(filmTokenSet, promptTokens, expandedTerms);

  // Quality is a tie-breaker among comparably relevant films, never a driver:
  // capped at one point so it can't outweigh a single genre match.
  if (film.imdbRating != null) score += Math.min(film.imdbRating / 10, 1);
  if (promptFlags.wantsUnderrated && !film.imdbTopMovieRank && !film.imdbTopTvRank) score += 2;
  if (promptFlags.rejectsGore && containsGoreToken(filmTokenSet)) score -= 5;

  return score;
}

// The guard covers the movie-vs-series axis only. Finer type distinctions
// (documentary, short, animation) are already settled by the SQL `types`
// overlap filter, where a film can legitimately carry several types.
function violatesContentType(film: RandomFilmRow, requested: string | null): boolean {
  if (requested === "movie") return film.contentType === "tv-series";
  if (requested === "tv-series") return film.contentType !== "tv-series";

  return false;
}

// Each requested genre the film carries earns a bonus; each one it lacks costs
// more than a bonus — so a film matching 3 of 3 requested genres always beats
// a film matching 1 of 3, no matter how the soft signals fall.
function genreScore(film: RandomFilmRow, requestedGenres: string[]): number {
  const filmGenres = new Set(film.genres.map(genre => genre.toLowerCase()));

  return requestedGenres.reduce((score, requested) => {
    const matched = filmGenres.has(requested.toLowerCase());

    return score + (matched ? WEIGHTS.genreMatch : WEIGHTS.genreMissing);
  }, 0);
}

// A soft signal ("bittersweet", "ambition", "character-driven") counts once
// per preference term when the film's text contains the term itself or any of
// its semantic expansions (music → jazz, soundtrack, pianist, …). The raw term
// is looked up before tokenizing so hyphenated table keys ("character-driven")
// resolve; the tokenized form then picks up single-word keys inside phrases
// ("bittersweet ending" → bittersweet).
function softSignalScore(terms: string[], filmTokenSet: Set<string>): number {
  return terms.reduce(
    (matches, term) => matches + (signalMatchesFilm(term, filmTokenSet) ? 1 : 0),
    0,
  );
}

function signalMatchesFilm(term: string, filmTokenSet: Set<string>): boolean {
  const direct = LOCAL_SEMANTIC_KEYWORDS[term.toLowerCase().trim()] ?? [];
  const expanded = expandTerms(new Set(tokenize([term, ...direct].join(" "))));

  return [...expanded].some(token => filmTokenSet.has(token));
}

function promptTokenSet(prompt: string): Set<string> {
  return new Set(tokenize(prompt).filter(token => token.length > 2));
}

function expandTerms(terms: Set<string>): Set<string> {
  const expanded = new Set(terms);

  for (const [term, keywords] of Object.entries(LOCAL_SEMANTIC_KEYWORDS)) {
    if (terms.has(term)) keywords.forEach(keyword => expanded.add(keyword));
  }

  return expanded;
}

function promptPreferences(prompt: string) {
  return {
    rejectsGore: /\b(rather than gore|not gore|no gore|less gore)\b/i.test(prompt),
    wantsUnderrated: /\b(underrated|hidden gem|obscure|overlooked)\b/i.test(prompt),
  };
}

function tokenScore(
  filmTokenSet: Set<string>,
  promptTokens: Set<string>,
  expandedTerms: Set<string>,
): number {
  let score = 0;
  for (const token of filmTokenSet) {
    if (promptTokens.has(token)) score += WEIGHTS.promptToken;
    else if (expandedTerms.has(token)) score += WEIGHTS.expandedToken;
  }

  return score;
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

function containsGoreToken(tokens: Set<string>): boolean {
  return ["gore", "bloody", "blood", "slasher"].some(token => tokens.has(token));
}
