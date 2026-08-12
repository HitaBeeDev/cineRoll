import { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma";
import type { SimilarFilmRow } from "./similarFilmRow";
import { narrowingSql, scoreSql } from "./similarityClauses";
import type { SimilaritySql } from "./similaritySql";

const SIMILAR_FILM_LIMIT = 6;

/**
 * Scored in a CTE so each criterion is written — and evaluated — once.
 *
 * The old query repeated every condition in both the WHERE and the ORDER BY.
 * That is duplication the planner is not obliged to collapse, and the ceremony
 * check alone expands three JSONB arrays per row, so the expensive half of the
 * work was being done twice on every candidate.
 *
 * `imdbRating` survives only as the last tie-break, after the weighted score.
 * It used to be the FIRST thing that separated candidates, which is how a page
 * about a film came to recommend five television series.
 */
export const querySimilarFilmRows = (
  excludedFilmId: string,
  similarity: SimilaritySql,
): Promise<SimilarFilmRow[]> => {
  return prisma.$queryRaw<SimilarFilmRow[]>(Prisma.sql`
    WITH candidates AS (
      SELECT
        "Film"."id",
        "Film"."slug",
        "Film"."title",
        "Film"."originalTitle",
        "Film"."year" AS "releaseYear",
        "Film"."year",
        "Film"."genres",
        "Film"."contentType",
        "Film"."types",
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
        "Film"."berlinWins",
        (${scoreSql(similarity)}) AS "similarityScore"
      FROM "Film"
      WHERE "Film"."id" != ${excludedFilmId}
        AND ${narrowingSql(similarity)}
    )
    SELECT * FROM candidates
    ORDER BY "similarityScore" DESC, "imdbRating" DESC NULLS LAST
    LIMIT ${SIMILAR_FILM_LIMIT}
  `);
};
