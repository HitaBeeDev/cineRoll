import { Prisma } from "@prisma/client";

import { RandomQuery } from "../../lib/filmFilters/randomQuerySchema";
import { prisma } from "../../lib/prisma";

export async function buildExclusionConditions(query: RandomQuery): Promise<Prisma.Sql[]> {
  const conditions: Prisma.Sql[] = [];
  const doNotSuggest = await doNotSuggestIdsCondition(query.userId);
  const excludedIdsCondition = clientExcludedIdsCondition(query);

  if (doNotSuggest) conditions.push(doNotSuggest);
  if (excludedIdsCondition) conditions.push(excludedIdsCondition);

  return conditions;
}

async function doNotSuggestIdsCondition(userId: string | undefined): Promise<Prisma.Sql | null> {
  if (!userId) return null;

  const excludedFilmIds = await getDoNotSuggestFilmIds(userId);
  return excludedFilmIds.length > 0
    ? Prisma.sql`"Film"."id" NOT IN (${Prisma.join(excludedFilmIds)})`
    : null;
}

function clientExcludedIdsCondition(query: RandomQuery): Prisma.Sql | null {
  if (!query.excludeIds || query.excludeIds.length === 0) return null;

  return Prisma.sql`"Film"."id" NOT IN (${Prisma.join(query.excludeIds)})`;
}

async function getDoNotSuggestFilmIds(userId: string): Promise<string[]> {
  const tableRows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT to_regclass('public."WatchedFilm"') IS NOT NULL AS "exists"
  `;

  if (tableRows[0]?.exists !== true) return [];

  const rows = await prisma.$queryRaw<{ filmId: string }[]>`
    SELECT "filmId"
    FROM "WatchedFilm"
    WHERE "userId" = ${userId}
      AND "doNotSuggest" = true
  `;

  return rows.map(row => row.filmId);
}
