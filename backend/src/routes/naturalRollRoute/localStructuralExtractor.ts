import {
  LOCAL_CATEGORY_PATTERNS,
  LOCAL_GENRE_PATTERNS,
  LOCAL_KEYWORD_PATTERNS,
  LOCAL_LANGUAGE_PATTERNS,
  LOCAL_TONE_PATTERNS,
} from "./patterns";
import { Stage1Filters, stage1Schema } from "./schemas";

export function extractLocalStructuralFilters(prompt: string): Stage1Filters {
  const filters: Stage1Filters = {};
  const lowerPrompt = prompt.toLowerCase();

  filters.language = firstMatch(prompt, LOCAL_LANGUAGE_PATTERNS);
  filters.genres = allMatches(prompt, LOCAL_GENRE_PATTERNS);
  filters.category = firstMatch(prompt, LOCAL_CATEGORY_PATTERNS);
  filters.tones = allMatches(prompt, LOCAL_TONE_PATTERNS);
  filters.keywords = allMatches(prompt, LOCAL_KEYWORD_PATTERNS);
  applyContentType(prompt, filters);
  applyResultCount(prompt, filters);
  applyAwardIntent(prompt, filters);
  Object.assign(filters, extractDecadeFilters(prompt));
  applyAwardYear(lowerPrompt, filters);

  return stage1Schema.parse(filters);
}

/** Deterministic extraction of the hard constraints (content type, result
 *  count) that the pipeline must never lose. Merged over the LLM extraction so
 *  a "movie" or "only one" stated in plain words survives even when the model
 *  omits it. */
export function extractLocalHardConstraints(
  prompt: string,
): Pick<Stage1Filters, "contentType" | "resultCount"> {
  const filters: Stage1Filters = {};
  applyContentType(prompt, filters);
  applyResultCount(prompt, filters);

  return { contentType: filters.contentType, resultCount: filters.resultCount };
}

function firstMatch<T>(prompt: string, patterns: Array<[RegExp, T]>): T | undefined {
  return patterns.find(([pattern]) => pattern.test(prompt))?.[1];
}

function allMatches<T>(prompt: string, patterns: Array<[RegExp, T]>): T[] | undefined {
  const matches = patterns.filter(([pattern]) => pattern.test(prompt)).map(([, value]) => value);

  return matches.length > 0 ? [...new Set(matches)] : undefined;
}

function applyContentType(prompt: string, filters: Stage1Filters): void {
  if (/\b(series|show|tv)\b/i.test(prompt)) filters.contentType = "series";
  if (/\b(film|movie|movies|feature)\b/i.test(prompt)) filters.contentType = "movie";
}

const COUNT_WORDS: Record<string, number> = {
  one: 1, single: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
};

// "Suggest only one movie", "one romantic drama movie", "give me three picks".
// The quantity word may be separated from its noun by adjectives ("one romantic
// drama movie") but never by "of" — "one of the best films" is not a count.
// Bare "a movie" stays unset: an article is a way of speaking, not a count.
function applyResultCount(prompt: string, filters: Stage1Filters): void {
  const quantified = prompt.match(
    /\b(one|single|two|three|four|five|six|[1-6])\s+(?:(?!of\b)[a-z'-]+\s+){0,4}?(?:movie|film|series|show|pick|title|recommendation)s?\b/i,
  );
  const word = quantified?.[1]?.toLowerCase();
  if (!word) return;

  filters.resultCount = COUNT_WORDS[word] ?? Number(word);
}

function applyAwardIntent(prompt: string, filters: Stage1Filters): void {
  if (/\b(oscar|academy award)\b/i.test(prompt)) filters.awardBody = "oscar";
  if (/\b(golden globe|globes)\b/i.test(prompt)) filters.awardBody = "goldenglobe";
  if (/\bcannes\b/i.test(prompt)) filters.awardBody = "cannes";
  if (/\b(winner|won|winning)\b/i.test(prompt)) filters.winnerOnly = true;
  if (/\b(nominee|nominated|nomination)\b/i.test(prompt)) filters.nominatedOnly = true;
  if (/\b(female|woman|women)\s+director\b/i.test(prompt)) filters.femaleDirectorOnly = true;
}

function applyAwardYear(prompt: string, filters: Stage1Filters): void {
  const awardYear = prompt.match(/\b(18|19|20)\d{2}\s+(oscars?|academy awards?|golden globes?|cannes)\b/i);
  if (awardYear) filters.awardYear = Number(awardYear[0].match(/\d{4}/)?.[0]);
}

function extractDecadeFilters(prompt: string): Pick<Stage1Filters, "decadeMin" | "decadeMax"> {
  const lastYears = prompt.match(/\blast\s+(\d{1,2})\s+years?\b/i);
  if (lastYears) return lastYearsRange(Number(lastYears[1]));

  const decade = prompt.match(/\b(18|19|20)(\d)0s\b/i);
  if (decade) return decadeRange(Number(`${decade[1]}${decade[2]}0`));

  const shorthandDecade = prompt.match(/\b(?:the\s+)?['’]?(\d{2})s\b/i);
  if (shorthandDecade) return shorthandDecadeRange(Number(shorthandDecade[1]));

  const afterYear = prompt.match(/\b(?:after|since|from)\s+(18|19|20)\d{2}\b/i);
  if (afterYear) return { decadeMin: Number(afterYear[0].match(/\d{4}/)?.[0]) };

  const beforeYear = prompt.match(/\b(?:before|pre)\s+(18|19|20)\d{2}\b/i);
  if (beforeYear) return { decadeMax: Number(beforeYear[0].match(/\d{4}/)?.[0]) };

  return {};
}

function lastYearsRange(years: number): Pick<Stage1Filters, "decadeMin" | "decadeMax"> {
  const currentYear = new Date().getFullYear();

  return { decadeMin: currentYear - years, decadeMax: currentYear };
}

function decadeRange(start: number): Pick<Stage1Filters, "decadeMin" | "decadeMax"> {
  return { decadeMin: start, decadeMax: start + 9 };
}

// A bare two-digit decade ("the 80s", "the 20s") is century-ambiguous. Resolve
// to the 2000s only for decades that have already begun — so "20s" is 2020s in
// 2026 but never a not-yet-started decade — otherwise the 1900s. The boundary
// tracks the current year rather than a hardcoded cutoff so it doesn't rot (in
// 2035, "30s" would become 2030s). A historic decade is reachable unambiguously
// via the full "1920s" form, which is matched before this shorthand.
function shorthandDecadeRange(value: number): Pick<Stage1Filters, "decadeMin" | "decadeMax"> {
  const currentDecade = Math.floor((new Date().getFullYear() % 100) / 10) * 10;
  const century = value <= currentDecade ? 2000 : 1900;

  return decadeRange(century + value);
}
