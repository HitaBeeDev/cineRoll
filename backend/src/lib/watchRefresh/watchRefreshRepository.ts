import type { WatchProviders } from "@cineroll/types";
import { prisma } from "../prisma";
import type { DueFilm } from "./refreshWatchProviders";

export async function countRefreshable(): Promise<number> {
  return prisma.film.count({ where: { tmdbId: { not: null } } });
}

/**
 * Least recently checked first. `asOf` is an ISO string, so text order is time
 * order; NULLS FIRST puts never-checked films (no column, or no asOf) ahead.
 */
export async function findDue(limit: number): Promise<DueFilm[]> {
  return prisma.$queryRaw<DueFilm[]>`
    SELECT "id", "tmdbId", "contentType", "watchProviders"
    FROM "Film"
    WHERE "tmdbId" IS NOT NULL
    ORDER BY ("watchProviders"->>'asOf') ASC NULLS FIRST, "id"
    LIMIT ${limit}
  `;
}

/**
 * Raw SQL on purpose: Prisma's @updatedAt would bump the film's "last updated"
 * date on every weekly check. It only moves when the services really changed.
 */
export async function saveWatchProviders(id: string, value: WatchProviders, changed: boolean): Promise<void> {
  await prisma.$executeRaw`
    UPDATE "Film"
    SET "watchProviders" = ${JSON.stringify(value)}::jsonb,
        "updatedAt" = CASE WHEN ${changed} THEN now() ELSE "updatedAt" END
    WHERE "id" = ${id}
  `;
}
