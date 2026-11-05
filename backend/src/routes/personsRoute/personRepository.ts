import { prisma } from "../../lib/prisma";
import type { AwardCreditRow } from "./personCreditTypes";
import { FilmRow } from "./types";

/**
 * Every award row in the Oscar, Golden Globe and Cannes category lists, with
 * its film. Loaded whole (≈22k rows) once a day by the person credit index,
 * because who a row credits is decided by `splitCredit`, not by SQL.
 */
export function findAllAwardCreditRows(): Promise<AwardCreditRow[]> {
  return prisma.$queryRaw<AwardCreditRow[]>`
    SELECT
      body,
      f."id" AS "filmId",
      f."slug" AS "filmSlug",
      f."title" AS "filmTitle",
      f."year" AS "releaseYear",
      f."posterUrl" AS "posterUrl",
      f."imdbRating" AS "imdbRating",
      f."updatedAt" AS "filmUpdatedAt",
      award->>'nominee' AS nominee,
      award->>'category' AS category,
      (award->>'awardYear')::INT AS "awardYear",
      (award->>'won')::BOOLEAN AS won
    FROM "Film" f
    CROSS JOIN LATERAL (
      SELECT 'oscar' AS body, a FROM jsonb_array_elements(f."oscarCategories") AS a
      UNION ALL
      SELECT 'gg', a FROM jsonb_array_elements(f."ggCategories") AS a
      UNION ALL
      SELECT 'cannes', a FROM jsonb_array_elements(f."cannesCategories") AS a
    ) AS rows(body, award)
  `;
}

/** Every director name in the catalogue — each gets a person page. */
export async function findAllDirectors(): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ name: string }[]>`
    SELECT DISTINCT "director" AS name FROM "Film"
    WHERE "director" IS NOT NULL AND "director" <> '' AND "director" <> 'NaN'
  `;
  return rows.map(row => row.name);
}

export function getPersonRecord(slug: string) {
  return prisma.person.findUnique({
    where: { slug },
    select: { photoUrl: true, bio: true },
  });
}

export function getDirectorFilms(name: string): Promise<FilmRow[]> {
  return prisma.$queryRaw<FilmRow[]>`
    SELECT "id", "slug", "title", "year" AS "releaseYear", "posterUrl", "imdbRating"
    FROM "Film"
    WHERE "director" ILIKE ${name}
    ORDER BY "year" DESC
  `;
}
