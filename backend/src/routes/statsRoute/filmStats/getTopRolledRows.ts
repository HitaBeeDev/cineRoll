import { prisma } from "../../../lib/prisma";
import type { FilmStatRow } from "../types";

export const getTopRolledRows = (): Promise<FilmStatRow[]> =>
  prisma.$queryRaw<FilmStatRow[]>`
    SELECT f."id", f."slug", f."title", f."year" AS "releaseYear", f."posterUrl",
      COUNT(*)::BIGINT AS count
    FROM "RollEvent" r
    JOIN "Film" f ON f."id" = r."filmId"
    GROUP BY f."id", f."slug", f."title", f."year", f."posterUrl"
    ORDER BY count DESC
    LIMIT 5
  `;
