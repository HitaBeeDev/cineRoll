import { prisma } from "../../../lib/prisma";
import type { FilmStatRow } from "../types";

export const getTopNominatedFilmRows = (): Promise<FilmStatRow[]> =>
  prisma.$queryRaw<FilmStatRow[]>`
    SELECT "id", "slug", "title", "year" AS "releaseYear", "posterUrl",
      ("oscarNominations" + "ggNominations" + "cannesNominations" + "berlinNominations")::BIGINT AS count
    FROM "Film"
    ORDER BY
      count DESC,
      ("oscarWins" + "ggWins" + "cannesWins" + "berlinWins") DESC,
      "title" ASC
    LIMIT 3
  `;
