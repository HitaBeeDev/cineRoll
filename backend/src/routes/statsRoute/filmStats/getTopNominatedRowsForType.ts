import type { Prisma } from "@prisma/client";

import { prisma } from "../../../lib/prisma";
import type { FilmStatRow } from "../types";

export const getTopNominatedRowsForType = (
  condition: Prisma.Sql,
): Promise<FilmStatRow[]> => prisma.$queryRaw<FilmStatRow[]>`
  SELECT "id", "slug", "title", "year" AS "releaseYear", "posterUrl",
    ("oscarNominations" + "ggNominations" + "cannesNominations" + "berlinNominations")::BIGINT AS count
  FROM "Film"
  WHERE ${condition}
    AND ("oscarNominations" + "ggNominations" + "cannesNominations" + "berlinNominations") > 0
  ORDER BY
    count DESC,
    ("oscarWins" + "ggWins" + "cannesWins" + "berlinWins") DESC,
    "title" ASC
  LIMIT 3
`;
