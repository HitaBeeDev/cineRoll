import { Prisma } from "@prisma/client";

import { awardFilter } from "./awardSql";
import { facetPredicates } from "./facetPredicates";
import { ListQuery } from "./querySchemas";
import { rangePredicates } from "./rangePredicates";
import { rankingPredicates } from "./rankingPredicates";
import { textPredicates } from "./textPredicates";
import { andWhereClause } from "./whereSql";

export function buildWhereClause(
  query: ListQuery,
  additionalConditions: Prisma.Sql[] = [],
): Prisma.Sql {
  const where = [
    ...additionalConditions,
    ...textPredicates(query),
    ...facetPredicates(query),
    ...rangePredicates(query),
    ...rankingPredicates(query),
  ];
  const awards = awardFilter(query);
  if (awards) where.push(awards);

  return andWhereClause(where);
}
