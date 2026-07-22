import { prisma } from "../../../lib/prisma";
import type { FilmStatRow } from "../types";

export const getTopWinningFilmRows = (): Promise<FilmStatRow[]> =>
  prisma.$queryRaw<FilmStatRow[]>`
    SELECT "id", "slug", "title", "year" AS "releaseYear", "posterUrl",
      ("oscarWins" + "ggWins" + "cannesWins" + "berlinWins")::BIGINT AS count
    FROM "Film"
    ORDER BY
      count DESC,
      ("oscarNominations" + "ggNominations" + "cannesNominations" + "berlinNominations") DESC,
      "title" ASC
    LIMIT 3
  `;
