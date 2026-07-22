import { prisma } from "../../../lib/prisma";
import type { DecadeTopFilmRow } from "../types";

export const getDecadeTopFilmRows = (): Promise<DecadeTopFilmRow[]> =>
  prisma.$queryRaw<DecadeTopFilmRow[]>`
    SELECT DISTINCT ON (FLOOR("year" / 10) * 10)
      FLOOR("year" / 10) * 10 AS decade,
      "title",
      "slug",
      ("oscarNominations" + "ggNominations" + "cannesNominations" + "berlinNominations")::BIGINT AS count
    FROM "Film"
    WHERE "year" IS NOT NULL AND "year" >= 1920
    ORDER BY
      FLOOR("year" / 10) * 10,
      ("oscarNominations" + "ggNominations" + "cannesNominations" + "berlinNominations") DESC,
      "title" ASC
  `;
