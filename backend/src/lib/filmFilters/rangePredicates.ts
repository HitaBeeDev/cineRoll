import { Prisma } from "@prisma/client";

import { ListQuery } from "./querySchemas";

export function rangePredicates(query: ListQuery): Prisma.Sql[] {
  return [
    ...runtimePredicates(query),
    minimumPredicate("year", query.decadeMin),
    maximumPredicate("year", query.decadeMax),
    ...imdbRatingPredicates(query),
    ...rtScorePredicates(query),
  ].filter((predicate): predicate is Prisma.Sql => predicate !== undefined);
}

function runtimePredicates(query: ListQuery): Prisma.Sql[] {
  if (query.runtimeMax === undefined) return [];

  return [
    Prisma.sql`"Film"."runtime" IS NOT NULL`,
    lessThanOrEqualPredicate("runtime", query.runtimeMax),
  ];
}

function imdbRatingPredicates(query: ListQuery): Prisma.Sql[] {
  return nullableNumberRangePredicates(
    "imdbRating",
    query.imdbRatingMin,
    query.imdbRatingMax,
  );
}

function rtScorePredicates(query: ListQuery): Prisma.Sql[] {
  if (query.rtScoreMin === undefined) return [];

  return [
    Prisma.sql`"Film"."rtScore" IS NOT NULL`,
    greaterThanOrEqualPredicate("rtScore", query.rtScoreMin),
  ];
}

function nullableNumberRangePredicates(
  column: string,
  min: number | undefined,
  max: number | undefined,
): Prisma.Sql[] {
  const predicates: Prisma.Sql[] = [];

  if (min !== undefined || max !== undefined) {
    predicates.push(Prisma.sql`${filmColumn(column)} IS NOT NULL`);
  }

  if (min !== undefined) predicates.push(greaterThanOrEqualPredicate(column, min));
  if (max !== undefined) predicates.push(lessThanOrEqualPredicate(column, max));

  return predicates;
}

function minimumPredicate(column: string, value: number | undefined): Prisma.Sql | undefined {
  if (value === undefined) return undefined;

  return greaterThanOrEqualPredicate(column, value);
}

function maximumPredicate(column: string, value: number | undefined): Prisma.Sql | undefined {
  if (value === undefined) return undefined;

  return lessThanOrEqualPredicate(column, value);
}

function greaterThanOrEqualPredicate(column: string, value: number): Prisma.Sql {
  return Prisma.sql`${filmColumn(column)} >= ${value}`;
}

function lessThanOrEqualPredicate(column: string, value: number): Prisma.Sql {
  return Prisma.sql`${filmColumn(column)} <= ${value}`;
}

function filmColumn(column: string): Prisma.Sql {
  return Prisma.raw(`"Film"."${column}"`);
}
