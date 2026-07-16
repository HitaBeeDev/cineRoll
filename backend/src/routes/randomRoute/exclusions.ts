import { Prisma } from "@prisma/client";

import { RandomQuery } from "../../lib/filmFilters/randomQuerySchema";
import { prisma } from "../../lib/prisma";

export async function buildExclusionConditions(query: RandomQuery): Promise<Prisma.Sql[]> {
  const conditions: Prisma.Sql[] = [];
  const watchedOrHidden = await watchedOrHiddenIdsCondition(query.userId);
  const excludedIdsCondition = clientExcludedIdsCondition(query);

  if (watchedOrHidden) conditions.push(watchedOrHidden);
  if (excludedIdsCondition) conditions.push(excludedIdsCondition);

  return conditions;
}

async function watchedOrHiddenIdsCondition(userId: string | undefined): Promise<Prisma.Sql | null> {
  if (!userId) return null;

  const excludedFilmIds = await getWatchedOrHiddenFilmIds(userId);
  return excludedFilmIds.length > 0
    ? Prisma.sql`"Film"."id" NOT IN (${Prisma.join(excludedFilmIds)})`
    : null;
}

function clientExcludedIdsCondition(query: RandomQuery): Prisma.Sql | null {
  if (!query.excludeIds || query.excludeIds.length === 0) return null;

  return Prisma.sql`"Film"."id" NOT IN (${Prisma.join(query.excludeIds)})`;
}

// Every WatchedFilm row is excluded from rolls: watched (doNotSuggest=false)
// and not-interested (doNotSuggest=true) alike — neither should roll again.
// Matches the recommender's candidate exclusions.
async function getWatchedOrHiddenFilmIds(userId: string): Promise<string[]> {
  const tableRows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT to_regclass('public."WatchedFilm"') IS NOT NULL AS "exists"
  `;

  if (tableRows[0]?.exists !== true) return [];

  const rows = await prisma.$queryRaw<{ filmId: string }[]>`
    SELECT "filmId"
    FROM "WatchedFilm"
    WHERE "userId" = ${userId}
  `;

  return rows.map(row => row.filmId);
}
