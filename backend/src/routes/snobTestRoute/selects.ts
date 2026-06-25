import { Prisma } from "@prisma/client";

export const snobTestFilmSelect = Prisma.sql`
  "Film"."id",
  "Film"."slug",
  "Film"."title",
  "Film"."originalTitle",
  "Film"."year" AS "releaseYear",
  "Film"."year",
  "Film"."genres",
  "Film"."posterUrl",
  "Film"."posterColor",
  "Film"."imdbRating",
  "Film"."imdbTopMovieRank",
  "Film"."imdbTopTvRank",
  "Film"."oscarNominations",
  "Film"."oscarWins",
  "Film"."ggNominations",
  "Film"."ggWins",
  "Film"."cannesNominations",
  "Film"."cannesWins",
  "Film"."berlinNominations",
  "Film"."berlinWins",
  (FLOOR("Film"."year" / 10) * 10)::INT AS "decade",
  ARRAY_REMOVE(ARRAY[
    CASE WHEN ("Film"."oscarNominations" + "Film"."oscarWins") > 0 THEN 'oscar' END,
    CASE WHEN ("Film"."ggNominations" + "Film"."ggWins") > 0 THEN 'goldenglobe' END,
    CASE WHEN ("Film"."cannesNominations" + "Film"."cannesWins") > 0 THEN 'cannes' END,
    CASE WHEN ("Film"."berlinNominations" + "Film"."berlinWins") > 0 THEN 'berlin' END
  ], NULL)::TEXT[] AS "awardBodies"
`;

export const scoreFilmSelect = Prisma.sql`
  "Film"."id",
  "Film"."year" AS "releaseYear",
  (FLOOR("Film"."year" / 10) * 10)::INT AS "decade",
  ARRAY_REMOVE(ARRAY[
    CASE WHEN ("Film"."oscarNominations" + "Film"."oscarWins") > 0 THEN 'oscar' END,
    CASE WHEN ("Film"."ggNominations" + "Film"."ggWins") > 0 THEN 'goldenglobe' END,
    CASE WHEN ("Film"."cannesNominations" + "Film"."cannesWins") > 0 THEN 'cannes' END,
    CASE WHEN ("Film"."berlinNominations" + "Film"."berlinWins") > 0 THEN 'berlin' END
  ], NULL)::TEXT[] AS "awardBodies"
`;
