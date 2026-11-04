import { prisma } from "../../lib/prisma";

export type SitemapEntry = { slug: string; updatedAt: Date };
export type PersonCreditRow = { name: string; credits: number; updatedAt: Date };

/** Every film page, with the real time its row last changed. */
export function findFilmSitemapRows(): Promise<SitemapEntry[]> {
  return prisma.film.findMany({
    select: { slug: true, updatedAt: true },
    orderBy: { slug: "asc" },
  });
}

/**
 * Award-credited people with at least `minCredits` credits, counted the same
 * way person pages count them (nominee entries in the Oscar, Golden Globe and
 * Cannes category lists). `updatedAt` is the newest change to any of their films.
 */
export function findPersonCreditRows(minCredits: number): Promise<PersonCreditRow[]> {
  return prisma.$queryRaw<PersonCreditRow[]>`
    SELECT name, COUNT(*)::INT AS credits, MAX(updated) AS "updatedAt"
    FROM (
      SELECT award->>'nominee' AS name, f."updatedAt" AS updated
      FROM "Film" f, jsonb_array_elements(f."oscarCategories") AS award
      UNION ALL
      SELECT award->>'nominee', f."updatedAt"
      FROM "Film" f, jsonb_array_elements(f."ggCategories") AS award
      UNION ALL
      SELECT award->>'nominee', f."updatedAt"
      FROM "Film" f, jsonb_array_elements(f."cannesCategories") AS award
    ) credits
    WHERE name IS NOT NULL AND name <> '' AND name <> 'NaN'
    GROUP BY name
    HAVING COUNT(*) >= ${minCredits}
  `;
}
