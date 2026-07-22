import { prisma } from "../../../lib/prisma";
import type { FilmStatRow } from "../types";

export const getTopWatchlistedRows = (
  useWatchlist: boolean,
): Promise<FilmStatRow[]> => {
  if (!useWatchlist) return Promise.resolve([]);

  return prisma.$queryRaw<FilmStatRow[]>`
    SELECT f."id", f."slug", f."title", f."year" AS "releaseYear", f."posterUrl",
      COUNT(*)::BIGINT AS count
    FROM "WatchlistEntry" w
    JOIN "Film" f ON f."id" = w."filmId"
    GROUP BY f."id", f."slug", f."title", f."year", f."posterUrl"
    ORDER BY count DESC
    LIMIT 5
  `;
};
