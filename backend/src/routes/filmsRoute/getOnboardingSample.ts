import { buildWhereClause } from "../../lib/filmFilters/whereClause";
import type { ListQuery } from "../../lib/filmFilters/listQuerySchema";
import { prisma } from "../../lib/prisma";
import { countFilms } from "./countFilms";
import { createFilmListPayload } from "./createFilmListPayload";
import type { FilmListPayload } from "./filmListPayload";
import { createOnboardingSampleConditions } from "./onboardingSampleConditions";
import { filmListSelect } from "./selects";

export const getOnboardingSample = async (
  query: ListQuery,
): Promise<FilmListPayload> => {
  const whereSql = buildWhereClause(query, createOnboardingSampleConditions());
  const [films, countRows] = await Promise.all([
    queryOnboardingSample(whereSql, query.limit),
    countFilms(whereSql),
  ]);

  return createFilmListPayload(films, countRows, 1, query.limit);
};

const queryOnboardingSample = (
  whereSql: ReturnType<typeof buildWhereClause>,
  limit: number,
): Promise<unknown[]> => prisma.$queryRaw<unknown[]>`
  -- Build a diverse pool, then use Efraimidis-Spirakis weighted-random keys.
  -- Recognizable films are more likely to appear without making the set static.
  WITH candidates AS (
    SELECT
      ${filmListSelect},
      (FLOOR("Film"."year" / 10) * 10)::INT AS "decade",
      COALESCE(("Film"."genres")[1], 'Other') AS "primaryGenre",
      GREATEST(
        0.15
        + CASE WHEN "Film"."imdbTopMovieRank" IS NOT NULL THEN 3.0 ELSE 0 END
        + LEAST(COALESCE("Film"."oscarWins", 0), 4) * 0.6
        + LEAST(COALESCE("Film"."oscarNominations", 0), 8) * 0.15
        + GREATEST(COALESCE("Film"."imdbRating", 0) - 6.0, 0) * 0.35,
        0.15
      ) AS "recog"
    FROM "Film"
    ${whereSql}
  ),
  ranked AS (
    SELECT
      candidates.*,
      ROW_NUMBER() OVER (
        PARTITION BY "decade" ORDER BY POWER(RANDOM(), 1.0 / "recog") DESC
      ) AS "decadeRank",
      ROW_NUMBER() OVER (
        PARTITION BY "primaryGenre" ORDER BY POWER(RANDOM(), 1.0 / "recog") DESC
      ) AS "genreRank"
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
    ORDER BY POWER(RANDOM(), 1.0 / "recog") DESC
    LIMIT ${limit}
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
    "tvSeasons",
    "tvEpisodes",
    "oscarNominations",
    "oscarWins",
    "ggNominations",
    "ggWins",
    "cannesNominations",
    "cannesWins",
    "berlinNominations",
    "berlinWins"
  FROM sampled
  ORDER BY RANDOM()
`;
