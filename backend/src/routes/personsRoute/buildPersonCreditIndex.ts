import { buildPersonNameIndex } from "./buildPersonNameIndex";
import type { AwardCreditRow, PersonCreditIndex } from "./personCreditTypes";
import { nameToSlug } from "./slug";
import { splitCredit } from "./splitCredit";

/**
 * Award rows + directors → who has a page and which rows are theirs. Each
 * row's nominee goes through `splitCredit`, so "Written by Pedro Almodóvar" is
 * Pedro Almodóvar's and "Joel Coen and Ethan Coen" is both Coens' — and the
 * strings themselves are no one. Directors get a page with or without award
 * rows of their own (the film's nominations are the reason they're here).
 */
export function buildPersonCreditIndex(rows: AwardCreditRow[], directors: string[]): PersonCreditIndex {
  const spellings: string[] = [...directors];
  const credits = new Map<string, AwardCreditRow[]>();

  for (const row of rows) {
    const slugs = new Set<string>();
    for (const name of splitCredit(row.nominee, row.filmTitle, row.category)) {
      const slug = nameToSlug(name);
      if (!slug || slugs.has(slug)) continue;
      slugs.add(slug);
      spellings.push(name);
      const list = credits.get(slug);
      if (list) list.push(row);
      else credits.set(slug, [row]);
    }
  }

  return { names: buildPersonNameIndex(spellings), credits };
}
