import type { Prisma } from "@prisma/client";

import type { ListQuery } from "../../lib/filmFilters/listQuerySchema";
import { prisma } from "../../lib/prisma";
import { filmListOrderBy } from "./orderBy";
import { filmListSelect } from "./selects";

/** One page of the filtered list. `page` is passed separately from `query` so a
 *  request for a page past the end can be re-issued against the last real one. */
export const queryFilmPage = (
  whereSql: Prisma.Sql,
  query: ListQuery,
  page: number,
): Promise<unknown[]> =>
  prisma.$queryRaw<unknown[]>`
    SELECT ${filmListSelect}
    FROM "Film"
    ${whereSql}
    ORDER BY ${filmListOrderBy(query.sort, query.sortOrder, query.search, query.awardBody)}
    LIMIT ${query.limit}
    OFFSET ${(page - 1) * query.limit}
  `;
