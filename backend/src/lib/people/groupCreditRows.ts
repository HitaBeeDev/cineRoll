import { splitCreditNames } from "./splitCreditNames";
import type { CreditRow, CreditSource, PersonSuggestion } from "./types";

type Accumulator = {
  variants: Map<string, number>;
  sources: Set<CreditSource>;
  filmIds: Set<string>;
};

/**
 * Turns raw credit rows into one entry per person: credit lines are split into
 * names, names that are really the film's own title are dropped, and the same
 * person written two ways ("Steven Spielberg" / "Steven SPIELBERG") merges into
 * a single row counted once per film.
 *
 * `query` is applied again here because splitting a line surfaces co-credits
 * the searcher never asked about — "kubrick" must not offer Terry Southern.
 */
export const groupCreditRows = (
  rows: CreditRow[],
  query: string,
  limit: number,
): PersonSuggestion[] => {
  const people = new Map<string, Accumulator>();
  const needle = query.trim().toLowerCase();

  for (const row of rows) {
    const filmTitleKey = titleKey(row.filmTitle);

    for (const name of splitCreditNames(row.name)) {
      if (!name.toLowerCase().includes(needle)) continue;
      if (titleKey(name) === filmTitleKey) continue;

      const person = people.get(name.toLowerCase()) ?? emptyAccumulator();
      person.variants.set(name, (person.variants.get(name) ?? 0) + 1);
      person.sources.add(row.source);
      person.filmIds.add(row.filmId);
      people.set(name.toLowerCase(), person);
    }
  }

  return [...people.values()]
    .map(toSuggestion)
    .sort(byRelevance(needle))
    .slice(0, limit);
};

const emptyAccumulator = (): Accumulator => ({
  variants: new Map(),
  sources: new Set(),
  filmIds: new Set(),
});

const toSuggestion = (person: Accumulator): PersonSuggestion => ({
  name: preferredCasing(person.variants),
  sources: [...person.sources].sort(),
  count: person.filmIds.size,
});

/**
 * Berlin credits shout the surname ("Steven SPIELBERG"). Between two spellings
 * of one name, prefer the one with fewer all-caps words, then the one seen most
 * often.
 */
const preferredCasing = (variants: Map<string, number>): string => {
  const [best] = [...variants.entries()].sort(
    ([leftName, leftSeen], [rightName, rightSeen]) =>
      shoutedWords(leftName) - shoutedWords(rightName) || rightSeen - leftSeen,
  );

  return best?.[0] ?? "";
};

const shoutedWords = (name: string): number =>
  name.split(" ").filter(word => word.length > 1 && word === word.toUpperCase()).length;

const byRelevance =
  (needle: string) =>
  (left: PersonSuggestion, right: PersonSuggestion): number =>
    prefixRank(left.name, needle) - prefixRank(right.name, needle) ||
    right.count - left.count ||
    left.name.localeCompare(right.name);

const prefixRank = (name: string, needle: string): number =>
  name.toLowerCase().startsWith(needle) ? 0 : 1;

/**
 * Award rows for best-film categories put the film's own title in the nominee
 * field, so "Foxcatcher" would otherwise be offered as a person. Compared on a
 * key that ignores punctuation and the article-at-end spelling ("Robe, The").
 */
const titleKey = (value: string): string =>
  value
    .toLowerCase()
    .replace(/^(.*),\s*(the|a|an)$/, "$2 $1")
    .replace(/[^a-z0-9]+/g, "");
