import { Prisma } from "@prisma/client";

import { buildWhereClause } from "../../../lib/filmFilters/whereClause";
import type { RandomQuery } from "../../../lib/filmFilters/randomQuerySchema";
import { prisma } from "../../../lib/prisma";
import { buildSimilaritySql } from "../../filmsRoute/buildSimilaritySql";
import { hasNarrowingCriterion, narrowingSql, scoreSql } from "../../filmsRoute/similarityClauses";
import { eligibilityConditions } from "../../randomRoute/eligibility";
import { buildExclusionConditions } from "../../randomRoute/exclusions";
import { randomSelect } from "../../randomRoute/selects";
import type { RandomFilmRow } from "../../random";
import { franchiseRoot } from "./franchiseRoot";
import type { ReferenceFilm } from "./referenceTypes";

/** Nearest neighbours of a catalogue film, in the shape the natural-roll
 *  pipeline already streams.
 *
 *  Reuses `buildSimilaritySql` — the same director / genre-overlap /
 *  ceremony-year criteria that power "Similar films" on the film-detail page —
 *  so both surfaces agree on what "similar" means.
 *
 *  The similarity criteria are layered ON TOP of the query the user's other
 *  words produced, not instead of it: "films like John Wick from the 90s" is
 *  still bounded by the 90s. Returns [] when the reference has no usable
 *  criteria, which the caller treats as "no reference retrieval" rather than
 *  as "no films exist". */
export const queryReferenceCandidates = async (
  film: ReferenceFilm,
  query: RandomQuery,
  limit: number,
): Promise<RandomFilmRow[]> => {
  const similarity = buildSimilaritySql(film);
  if (!hasNarrowingCriterion(similarity)) return [];

  const whereSql = buildWhereClause(query, [
    ...eligibilityConditions(),
    ...(await buildExclusionConditions(query)),
    Prisma.sql`"Film"."id" <> ${film.id}`,
    ...franchiseExclusion(film.title),
    narrowingSql(similarity),
  ]);

  return prisma.$queryRaw<RandomFilmRow[]>(Prisma.sql`
    SELECT ${randomSelect}
    FROM "Film"
    ${whereSql}
    ORDER BY (${scoreSql(similarity)}) DESC,
      "Film"."imdbRating" DESC NULLS LAST
    LIMIT ${limit}
  `);
};

// A user asking for something *like* a film already knows its sequels, so the
// franchise itself is not an answer. Excluded by title stem, since the
// catalogue has no franchise column.
function franchiseExclusion(title: string): Prisma.Sql[] {
  const root = franchiseRoot(title);
  if (!root) return [];

  return [Prisma.sql`"Film"."title" NOT ILIKE ${`${root}%`}`];
}
