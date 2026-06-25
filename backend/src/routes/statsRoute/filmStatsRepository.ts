import { prisma } from "../../lib/prisma";
import { FilmStatRow } from "./types";

export function getMostNominatedFilmRows(): Promise<FilmStatRow[]> {
  return prisma.$queryRaw<FilmStatRow[]>`
    SELECT "id", "slug", "title", "year" AS "releaseYear", "posterUrl",
      ("oscarNominations" + "ggNominations" + "cannesNominations")::BIGINT AS count
    FROM "Film"
    ORDER BY count DESC
    LIMIT 1
  `;
}

export function getMostWinningFilmRows(): Promise<FilmStatRow[]> {
  return prisma.$queryRaw<FilmStatRow[]>`
    SELECT "id", "slug", "title", "year" AS "releaseYear", "posterUrl",
      ("oscarWins" + "ggWins" + "cannesWins")::BIGINT AS count
    FROM "Film"
    ORDER BY count DESC
    LIMIT 1
  `;
}

export function getTopRolledRows(): Promise<FilmStatRow[]> {
  return prisma.$queryRaw<FilmStatRow[]>`
    SELECT f."id", f."slug", f."title", f."year" AS "releaseYear", f."posterUrl",
      COUNT(*)::BIGINT AS count
    FROM "RollEvent" r
    JOIN "Film" f ON f."id" = r."filmId"
    GROUP BY f."id", f."slug", f."title", f."year", f."posterUrl"
    ORDER BY count DESC
    LIMIT 5
  `;
}

export function getTopWatchlistedRows(useWatchlist: boolean): Promise<FilmStatRow[]> {
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
}
