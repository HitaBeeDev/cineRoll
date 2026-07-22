import type { Prisma } from "@prisma/client";

import { prisma } from "../../../lib/prisma";
import type { FilmStatRow } from "../types";

export const getTopWinningRowsForType = (
  condition: Prisma.Sql,
): Promise<FilmStatRow[]> => prisma.$queryRaw<FilmStatRow[]>`
  SELECT "id", "slug", "title", "year" AS "releaseYear", "posterUrl",
    ("oscarWins" + "ggWins" + "cannesWins" + "berlinWins")::BIGINT AS count
  FROM "Film"
  WHERE ${condition}
    AND ("oscarWins" + "ggWins" + "cannesWins" + "berlinWins") > 0
  ORDER BY
    count DESC,
    ("oscarNominations" + "ggNominations" + "cannesNominations" + "berlinNominations") DESC,
    "title" ASC
  LIMIT 3
`;
