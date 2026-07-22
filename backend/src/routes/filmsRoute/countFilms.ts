import type { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma";

export type FilmCountRow = { count: bigint };

export const countFilms = (whereSql: Prisma.Sql): Promise<FilmCountRow[]> =>
  prisma.$queryRaw<FilmCountRow[]>`
    SELECT COUNT(*)::BIGINT AS count
    FROM "Film"
    ${whereSql}
  `;
