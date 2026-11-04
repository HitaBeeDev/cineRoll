import { nameToSlug, slugToCandidateName } from "../personsRoute/slug";
import type { PersonCreditRow, SitemapEntry } from "./sitemapRepository";

/**
 * Turns credited names into person-page entries, keeping only slugs the person
 * route can resolve back to the name: those with a Person row (any spelling),
 * plus plain names the dashes-as-spaces fallback finds. Anything else would 404
 * and must not be handed to Google. Duplicate slugs keep the newest date.
 */
export function personSitemapEntries(
  rows: PersonCreditRow[],
  personSlugs: Set<string>,
): SitemapEntry[] {
  const bySlug = new Map<string, Date>();

  for (const row of rows) {
    const slug = nameToSlug(row.name);
    const resolvable =
      personSlugs.has(slug) || slugToCandidateName(slug) === row.name.toLowerCase();
    if (!slug || !resolvable) continue;

    const updatedAt = new Date(row.updatedAt);
    const existing = bySlug.get(slug);
    if (!existing || updatedAt > existing) bySlug.set(slug, updatedAt);
  }

  return [...bySlug].map(([slug, updatedAt]) => ({ slug, updatedAt }));
}
