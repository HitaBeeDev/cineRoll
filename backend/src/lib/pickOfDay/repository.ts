import { Prisma } from "@prisma/client";

import { prisma } from "../prisma";
import { PICK_OF_DAY_CONFIG } from "./constants";
import { daysBeforeNow } from "./date";
import { POOL_COLUMNS, pickOfDaySelect } from "./select";
import { PickRow, PoolRow } from "./types";

export async function fetchPick(filmId: string): Promise<PickRow | null> {
  return prisma.film.findUnique({ where: { id: filmId }, select: pickOfDaySelect });
}

export async function findPickHistory(date: Date) {
  return prisma.pickOfDayHistory.findUnique({ where: { date } });
}

export async function deletePickHistory(date: Date): Promise<void> {
  await prisma.pickOfDayHistory.delete({ where: { date } }).catch(() => {});
}

export async function findRecentPickFilmIds(since: Date): Promise<string[]> {
  const recent = await prisma.pickOfDayHistory.findMany({
    where: { date: { gte: since } },
    select: { filmId: true },
  });

  return [...new Set(recent.map(row => row.filmId))];
}

export async function createPickHistory(filmId: string, date: Date): Promise<void> {
  await prisma.pickOfDayHistory.create({ data: { filmId, date } });
}

export async function loadPool(excludeIds: string[]): Promise<PoolRow[]> {
  const rollWindow = daysBeforeNow(PICK_OF_DAY_CONFIG.rollWindowDays);
  const excludeSql =
    excludeIds.length > 0
      ? Prisma.sql`AND f."id" NOT IN (${Prisma.join(excludeIds)})`
      : Prisma.empty;

  return prisma.$queryRaw<PoolRow[]>(Prisma.sql`
    SELECT ${POOL_COLUMNS},
      (
        f."oscarWins" * 4 + f."ggWins" * 2 + f."cannesWins" * 3 + f."berlinWins" * 3
        + f."oscarNominations" + f."ggNominations" * 0.5
        + f."cannesNominations" + f."berlinNominations"
        + COALESCE(f."imdbRating", 0) + COALESCE(f."rtScore", 0) / 10.0
      )::float8 AS "prestige",
      COALESCE(r.cnt, 0)::int AS "rollCount"
    FROM "Film" f
    LEFT JOIN (
      SELECT "filmId", COUNT(*)::int AS cnt
      FROM "RollEvent"
      WHERE "rolledAt" >= ${rollWindow}
      GROUP BY "filmId"
    ) r ON r."filmId" = f."id"
    WHERE f."posterUrl" IS NOT NULL
      AND (
        f."oscarWins" + f."ggWins" + f."cannesWins" + f."berlinWins"
        + f."oscarNominations" + f."ggNominations" + f."cannesNominations" + f."berlinNominations" > 0
        OR (f."imdbRating" >= 7 AND f."rtScore" >= 70)
      )
      ${excludeSql}
    ORDER BY "prestige" DESC
    LIMIT ${PICK_OF_DAY_CONFIG.poolSize}
  `);
}
