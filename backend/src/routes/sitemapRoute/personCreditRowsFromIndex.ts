import type { PersonCreditIndex } from "../personsRoute/personCreditTypes";
import type { PersonCreditRow } from "./sitemapRepository";

/**
 * Sitemap rows from the person credit index: people with at least
 * `minCredits` award rows (after credit lines are split into people), dated by
 * the newest change to any of their films. The same index the person page
 * resolves against, so every listed URL exists.
 */
export function personCreditRowsFromIndex(index: PersonCreditIndex, minCredits: number): PersonCreditRow[] {
  const rows: PersonCreditRow[] = [];
  for (const [slug, credits] of index.credits) {
    const name = index.names.get(slug);
    if (!name || credits.length < minCredits) continue;
    const updatedAt = credits.reduce(
      (newest, credit) => (new Date(credit.filmUpdatedAt) > newest ? new Date(credit.filmUpdatedAt) : newest),
      new Date(0),
    );
    rows.push({ name, credits: credits.length, updatedAt });
  }
  return rows;
}
