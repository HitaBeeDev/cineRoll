import { prisma } from "../../lib/prisma";

let watchlistTableExists: boolean | null = null;

export async function hasWatchlist(): Promise<boolean> {
  if (watchlistTableExists !== null) return watchlistTableExists;

  const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT to_regclass('public."WatchlistEntry"') IS NOT NULL AS "exists"
  `;
  watchlistTableExists = rows[0]?.exists === true;

  return watchlistTableExists;
}
