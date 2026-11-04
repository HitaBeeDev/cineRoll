import { nameToSlug } from "../personsRoute/slug";
import type { PersonCreditRow, SitemapEntry } from "./sitemapRepository";

/**
 * Turns credited names into person-page entries. Every name here is one the
 * person route's slug index knows (same sources), so every URL resolves —
 * accented and hyphenated names included. Spellings that share a slug collapse
 * into one entry carrying the newest date.
 */
export function personSitemapEntries(rows: PersonCreditRow[]): SitemapEntry[] {
  const bySlug = new Map<string, Date>();

  for (const row of rows) {
    const slug = nameToSlug(row.name);
    if (!slug) continue;

    const updatedAt = new Date(row.updatedAt);
    const existing = bySlug.get(slug);
    if (!existing || updatedAt > existing) bySlug.set(slug, updatedAt);
  }

  return [...bySlug].map(([slug, updatedAt]) => ({ slug, updatedAt }));
}
