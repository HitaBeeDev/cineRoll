import { Prisma } from "@prisma/client";

import type { SimilaritySql } from "./similaritySql";

/**
 * The two SQL fragments every similarity consumer needs, derived in one place.
 *
 * Both the film-detail "Similar films" row and natural-roll's reference-film
 * retrieval read the same criteria, and they have to agree on what "similar"
 * means — including which criteria are allowed to define the candidate set and
 * which only rank it. Deriving that twice is how the two drift apart.
 */

/** Candidate set: OR of the criteria that alone justify consideration. */
export const narrowingSql = (similarity: SimilaritySql): Prisma.Sql =>
  Prisma.sql`(${Prisma.join(
    similarity.criteria.filter(criterion => criterion.narrowing).map(criterion => criterion.condition),
    " OR ",
  )})`;

/** Weighted similarity score: every criterion contributes, narrowing or not. */
export const scoreSql = (similarity: SimilaritySql): Prisma.Sql =>
  Prisma.join(
    similarity.criteria.map(
      criterion => Prisma.sql`(CASE WHEN ${criterion.condition} THEN ${criterion.weight} ELSE 0 END)`,
    ),
    " + ",
  );

/** Whether anything can define a neighbourhood at all. */
export const hasNarrowingCriterion = (similarity: SimilaritySql): boolean =>
  similarity.criteria.some(criterion => criterion.narrowing);
