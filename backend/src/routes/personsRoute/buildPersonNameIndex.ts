import { nameToSlug } from "./slug";

/**
 * Slug → exact award-data name.
 *
 * A slug drops accents and punctuation ("Pedro Almodóvar" → "pedro-almodovar"),
 * so it cannot be turned back into the name by string tricks. Slugging every
 * known name once and looking the slug up makes accents and hyphens irrelevant.
 * When two spellings share a slug the one with fewer capitals wins ("Pedro
 * Almodóvar" over "Pedro ALMODÓVAR"); the credit queries match names
 * case-insensitively, so either finds the same records.
 */
export function buildPersonNameIndex(names: string[]): Map<string, string> {
  const index = new Map<string, string>();

  for (const name of names) {
    const slug = nameToSlug(name);
    if (!slug) continue;
    const current = index.get(slug);
    if (current === undefined || capitals(name) < capitals(current)) index.set(slug, name);
  }

  return index;
}

function capitals(name: string): number {
  return (name.match(/\p{Lu}/gu) ?? []).length;
}
