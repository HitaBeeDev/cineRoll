import { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma";
import type { SimilarFilmRow } from "./similarFilmRow";
import type { SimilaritySql } from "./similaritySql";

const SIMILAR_FILM_LIMIT = 6;

export const querySimilarFilmRows = (
  excludedFilmId: string,
  similarity: SimilaritySql,
): Promise<SimilarFilmRow[]> => prisma.$queryRaw<SimilarFilmRow[]>(Prisma.sql`
  SELECT
    "Film"."id",
    "Film"."slug",
    "Film"."title",
    "Film"."originalTitle",
    "Film"."year" AS "releaseYear",
    "Film"."year",
    "Film"."genres",
    "Film"."contentType",
    "Film"."director",
    "Film"."posterUrl",
    "Film"."posterColor",
    "Film"."imdbRating",
    "Film"."imdbTopMovieRank",
    "Film"."imdbTopTvRank",
    "Film"."certificate",
    "Film"."tvType",
    "Film"."tvStartYear",
    "Film"."tvEndYear",
    "Film"."tvSeasons",
    "Film"."tvEpisodes",
    "Film"."oscarNominations",
    "Film"."oscarWins",
    "Film"."ggNominations",
    "Film"."ggWins",
    "Film"."cannesNominations",
    "Film"."cannesWins",
    "Film"."berlinNominations",
    "Film"."berlinWins"
  FROM "Film"
  WHERE "Film"."id" != ${excludedFilmId}
    AND (${Prisma.join(similarity.whereParts, " OR ")})
  ORDER BY (${Prisma.join(similarity.scoreParts, " + ")}) DESC,
    "Film"."imdbRating" DESC NULLS LAST
  LIMIT ${SIMILAR_FILM_LIMIT}
`);
