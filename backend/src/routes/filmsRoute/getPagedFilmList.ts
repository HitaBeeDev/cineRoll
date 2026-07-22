import { buildWhereClause } from "../../lib/filmFilters/whereClause";
import type { ListQuery } from "../../lib/filmFilters/listQuerySchema";
import { prisma } from "../../lib/prisma";
import { countFilms } from "./countFilms";
import { createFilmListPayload } from "./createFilmListPayload";
import type { FilmListPayload } from "./filmListPayload";
import { filmListOrderBy } from "./orderBy";
import { filmListSelect } from "./selects";

export const getPagedFilmList = async (
  query: ListQuery,
): Promise<FilmListPayload> => {
  const whereSql = buildWhereClause(query);
  const offset = (query.page - 1) * query.limit;
  const [films, countRows] = await Promise.all([
    prisma.$queryRaw<unknown[]>`
      SELECT ${filmListSelect}
      FROM "Film"
      ${whereSql}
      ORDER BY ${filmListOrderBy(query.sort, query.sortOrder, query.search, query.awardBody)}
      LIMIT ${query.limit}
      OFFSET ${offset}
    `,
    countFilms(whereSql),
  ]);

  return createFilmListPayload(films, countRows, query.page, query.limit);
};
