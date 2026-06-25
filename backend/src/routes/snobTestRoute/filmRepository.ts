import { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma";
import { SNOB_TEST_FILM_COUNT } from "./constants";
import { scoreFilmSelect, snobTestFilmSelect } from "./selects";
import { ScoreFilmRow, SnobTestFilmRow } from "./types";

export function getSnobTestFilms(excludeFilmIds: string[]): Promise<SnobTestFilmRow[]> {
  const uniqueExcludeFilmIds = [...new Set(excludeFilmIds)];
  const excludeSql =
    uniqueExcludeFilmIds.length > 0
      ? Prisma.sql`AND "Film"."id" NOT IN (${Prisma.join(uniqueExcludeFilmIds)})`
      : Prisma.empty;

  return prisma.$queryRaw<SnobTestFilmRow[]>`
    WITH candidates AS (
      SELECT
        ${snobTestFilmSelect},
        COALESCE(("Film"."genres")[1], 'Other') AS "primaryGenre",
        TRIM(BOTH FROM REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(LOWER("Film"."title"), '^(the|a|an)\s+', ''),
            '[:].*$',
            ''
          ),
          '[[:space:]]+(part|chapter|episode)[[:space:]]+[ivxlcdm0-9]+$',
          ''
        )
        ) AS "titleRoot",
        CASE
          WHEN ("Film"."oscarNominations" + ("Film"."oscarWins" * 2)) >= GREATEST(
            "Film"."ggNominations" + ("Film"."ggWins" * 2),
            "Film"."cannesNominations" + ("Film"."cannesWins" * 2)
          ) THEN 'oscar'
          WHEN ("Film"."ggNominations" + ("Film"."ggWins" * 2)) >= ("Film"."cannesNominations" + ("Film"."cannesWins" * 2)) THEN 'goldenglobe'
          ELSE 'cannes'
        END AS "primaryAwardBody",
        (
          COALESCE("Film"."imdbRating", 0) * 9
          + CASE WHEN "Film"."imdbTopMovieRank" IS NOT NULL THEN ((260 - "Film"."imdbTopMovieRank") * 0.55) ELSE 0 END
          + CASE WHEN "Film"."imdbTopTvRank" IS NOT NULL THEN ((260 - "Film"."imdbTopTvRank") * 0.55) ELSE 0 END
          + ("Film"."oscarWins" * 10)
          + ("Film"."ggWins" * 7)
          + ("Film"."cannesWins" * 8)
          + (("Film"."oscarNominations" + "Film"."ggNominations" + "Film"."cannesNominations") * 1.5)
          + CASE WHEN "Film"."posterUrl" IS NOT NULL THEN 8 ELSE 0 END
        ) AS "knownScore"
      FROM "Film"
      WHERE ("Film"."oscarNominations" + "Film"."oscarWins" + "Film"."ggNominations" + "Film"."ggWins" + "Film"."cannesNominations" + "Film"."cannesWins") > 0
        ${excludeSql}
    ),
    ranked AS (
      SELECT
        candidates.*,
        ROW_NUMBER() OVER (PARTITION BY "decade" ORDER BY "knownScore" + (RANDOM() * 70) DESC) AS "decadeRank",
        ROW_NUMBER() OVER (PARTITION BY "primaryGenre" ORDER BY "knownScore" + (RANDOM() * 70) DESC) AS "genreRank",
        ROW_NUMBER() OVER (PARTITION BY "primaryAwardBody" ORDER BY "knownScore" + (RANDOM() * 70) DESC) AS "awardBodyRank",
        ROW_NUMBER() OVER (PARTITION BY "titleRoot" ORDER BY "knownScore" + (RANDOM() * 70) DESC) AS "titleRootRank"
      FROM candidates
    ),
    spread_pool AS (
      SELECT *
      FROM ranked
      WHERE ("decadeRank" <= 3 OR "genreRank" <= 2 OR "awardBodyRank" <= 8)
        AND "titleRootRank" = 1
    ),
    sampled AS (
      SELECT *
      FROM spread_pool
      ORDER BY "knownScore" + (RANDOM() * 140) DESC
      LIMIT ${SNOB_TEST_FILM_COUNT}
    )
    SELECT
      "id",
      "slug",
      "title",
      "originalTitle",
      "releaseYear",
      "year",
      "genres",
      "posterUrl",
      "posterColor",
      "imdbRating",
      "imdbTopMovieRank",
      "imdbTopTvRank",
      "decade",
      "awardBodies",
      "oscarNominations",
      "oscarWins",
      "ggNominations",
      "ggWins",
      "cannesNominations",
      "cannesWins"
    FROM sampled
    ORDER BY RANDOM()
  `;
}

export function getScoreFilms(seenFilmIds: string[]): Promise<ScoreFilmRow[]> {
  const uniqueSeenFilmIds = [...new Set(seenFilmIds)];
  if (uniqueSeenFilmIds.length === 0) return Promise.resolve([]);

  return prisma.$queryRaw<ScoreFilmRow[]>`
    SELECT ${scoreFilmSelect}
    FROM "Film"
    WHERE "Film"."id" IN (${Prisma.join(uniqueSeenFilmIds)})
  `;
}
