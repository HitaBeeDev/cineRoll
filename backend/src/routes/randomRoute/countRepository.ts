import { Prisma } from "@prisma/client";

import { cache, cacheKeys } from "../../lib/cache";
import { RandomQuery } from "../../lib/filmFilters/randomQuerySchema";
import { prisma } from "../../lib/prisma";
import { RANDOM_COUNT_TTL_MS } from "./constants";

export async function countFilms(
  query: RandomQuery,
  whereSql: Prisma.Sql,
  cacheable: boolean,
): Promise<number> {
  const run = async () => {
    const rows = await prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::BIGINT AS count FROM "Film" ${whereSql}
    `;
    return Number(rows[0]?.count ?? 0);
  };

  if (!cacheable) return run();

  return cache.getOrSet(cacheKeys.randomCount(filterSignature(query)), RANDOM_COUNT_TTL_MS, run);
}

function filterSignature(query: RandomQuery): string {
  const { userId: _userId, personalized: _personalized, ...filters } = query;

  return JSON.stringify(filters, Object.keys(filters).sort());
}
