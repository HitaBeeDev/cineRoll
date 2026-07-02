import { Prisma } from "@prisma/client";

import { buildWhereClause } from "../../lib/filmFilters/whereClause";
import { ListQuery } from "../../lib/filmFilters/listQuerySchema";
import { prisma } from "../../lib/prisma";
import { filmListOrderBy } from "./orderBy";
import { filmListSelect } from "./selects";

export type FilmListPayload = {
  films: unknown[];
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
};

export async function getFilmList(query: ListQuery): Promise<FilmListPayload> {
  return query.sample === "onboarding"
    ? getOnboardingSample(query)
    : getPagedFilmList(query);
}

function onboardingSampleConditions(): Prisma.Sql[] {
  return [
    Prisma.sql`"Film"."contentType" = 'movie'`,
    Prisma.sql`"Film"."posterUrl" IS NOT NULL`,
    Prisma.sql`"Film"."imdbRating" IS NOT NULL`,
  ];
}

async function getOnboardingSample(query: ListQuery): Promise<FilmListPayload> {
  const whereSql = buildWhereClause(query, onboardingSampleConditions());
  const [films, countRows] = await Promise.all([
    prisma.$queryRaw<unknown[]>`
      WITH candidates AS (
        SELECT
          ${filmListSelect},
          (FLOOR("Film"."year" / 10) * 10)::INT AS "decade",
          COALESCE(("Film"."genres")[1], 'Other') AS "primaryGenre"
        FROM "Film"
        ${whereSql}
      ),
      ranked AS (
        SELECT
          candidates.*,
          ROW_NUMBER() OVER (PARTITION BY "decade" ORDER BY RANDOM()) AS "decadeRank",
          ROW_NUMBER() OVER (PARTITION BY "primaryGenre" ORDER BY RANDOM()) AS "genreRank"
        FROM candidates
      ),
      spread_pool AS (
        SELECT *
        FROM ranked
        WHERE "decadeRank" <= 2 OR "genreRank" <= 2
      ),
      sampled AS (
        SELECT *
        FROM spread_pool
        ORDER BY RANDOM()
        LIMIT ${query.limit}
      )
      SELECT
        "id",
        "slug",
        "title",
        "originalTitle",
        "releaseYear",
        "year",
        "genres",
        "contentType",
        "posterUrl",
        "posterColor",
        "imdbRating",
        "rtScore",
        "imdbTopMovieRank",
        "imdbTopTvRank",
        "certificate",
        "tvType",
        "tvStartYear",
        "tvEndYear",
        "oscarNominations",
        "oscarWins",
        "ggNominations",
        "ggWins",
        "cannesNominations",
        "cannesWins",
        "berlinNominations",
        "berlinWins",
        "averageRating",
        "ratingCount"
      FROM sampled
      ORDER BY RANDOM()
    `,
    countFilms(whereSql),
  ]);

  return filmListPayload(films, countRows, 1, query.limit);
}

async function getPagedFilmList(query: ListQuery): Promise<FilmListPayload> {
  const whereSql = buildWhereClause(query);
  const offset = (query.page - 1) * query.limit;
  const [films, countRows] = await Promise.all([
    prisma.$queryRaw<unknown[]>`
      SELECT ${filmListSelect}
      FROM "Film"
      ${whereSql}
      ORDER BY ${filmListOrderBy(query.sort, query.sortOrder, query.search)}
      LIMIT ${query.limit}
      OFFSET ${offset}
    `,
    countFilms(whereSql),
  ]);

  return filmListPayload(films, countRows, query.page, query.limit);
}

function countFilms(whereSql: Prisma.Sql): Promise<{ count: bigint }[]> {
  return prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*)::BIGINT AS count
    FROM "Film"
    ${whereSql}
  `;
}

function filmListPayload(
  films: unknown[],
  countRows: { count: bigint }[],
  page: number,
  pageSize: number,
): FilmListPayload {
  const total = Number(countRows[0]?.count ?? 0);

  return {
    films,
    total,
    page,
    totalPages: Math.ceil(total / pageSize),
    pageSize,
  };
}
