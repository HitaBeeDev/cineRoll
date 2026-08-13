import { Prisma } from "@prisma/client";

import { prisma } from "../prisma";
import type { CreditRow, CreditSource } from "./types";

/**
 * How many raw credit lines are read before grouping. Splitting and merging
 * happens in application code, so the cap bounds that work for a query broad
 * enough to match half the catalogue ("a"); for any query specific enough to
 * pick a person from a dropdown it is never reached.
 */
const ROW_LIMIT = 1500;

const AWARD_COLUMNS = [
  Prisma.sql`"Film"."oscarCategories"`,
  Prisma.sql`"Film"."ggCategories"`,
  Prisma.sql`"Film"."cannesCategories"`,
  Prisma.sql`"Film"."berlinCategories"`,
];

export async function fetchCreditRows(
  query: string,
  sources: CreditSource[],
): Promise<CreditRow[]> {
  const queryLike = `%${query}%`;
  const queryPrefix = `${query}%`;
  const selects = sources.flatMap(source => sourceSelects(source, queryLike));
  if (selects.length === 0) return [];

  return prisma.$queryRaw<CreditRow[]>`
    WITH credits AS (
      ${Prisma.join(selects, " UNION ALL ")}
    )
    SELECT "name", "source", "filmId", "filmTitle"
    FROM credits
    WHERE "name" IS NOT NULL AND "name" <> '' AND "name" <> 'NaN'
    ORDER BY CASE WHEN "name" ILIKE ${queryPrefix} THEN 0 ELSE 1 END, "name" ASC
    LIMIT ${ROW_LIMIT}
  `;
}

const sourceSelects = (source: CreditSource, queryLike: string): Prisma.Sql[] => {
  if (source === "director") return [directorSelect(queryLike)];
  if (source === "cast") return [castSelect(queryLike)];

  return AWARD_COLUMNS.map(column => nomineeSelect(column, queryLike));
};

const directorSelect = (queryLike: string): Prisma.Sql => Prisma.sql`
  SELECT
    "Film"."director" AS "name",
    'director' AS "source",
    "Film"."id" AS "filmId",
    "Film"."title" AS "filmTitle"
  FROM "Film"
  WHERE "Film"."director" ILIKE ${queryLike}
`;

// `cast` holds objects, not strings — the name lives under the `name` key.
const castSelect = (queryLike: string): Prisma.Sql => Prisma.sql`
  SELECT
    "castMember"->>'name' AS "name",
    'cast' AS "source",
    "Film"."id" AS "filmId",
    "Film"."title" AS "filmTitle"
  FROM "Film", jsonb_array_elements("Film"."cast") AS "castMember"
  WHERE "castMember"->>'name' ILIKE ${queryLike}
`;

const nomineeSelect = (column: Prisma.Sql, queryLike: string): Prisma.Sql => Prisma.sql`
  SELECT
    award->>'nominee' AS "name",
    'nominee' AS "source",
    "Film"."id" AS "filmId",
    "Film"."title" AS "filmTitle"
  FROM "Film", jsonb_array_elements(${column}) AS award
  WHERE award->>'nominee' ILIKE ${queryLike}
`;
