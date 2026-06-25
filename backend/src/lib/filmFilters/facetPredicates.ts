import { Prisma } from "@prisma/client";

import { ListQuery } from "./listQuerySchema";

export function facetPredicates(query: ListQuery): Prisma.Sql[] {
  return [
    equalsAnyPredicate("contentType", query.contentType),
    equalsAnyPredicate("language", query.language),
    arrayOverlapPredicate("countries", query.country),
    arrayOverlapPredicate("genres", query.genre),
    exactValuePredicate("certificate", query.certificate),
    tvTypePredicate(query),
  ].filter((predicate): predicate is Prisma.Sql => predicate !== undefined);
}

function equalsAnyPredicate(column: string, values: string[] | undefined): Prisma.Sql | undefined {
  if (!values || values.length === 0) return undefined;

  return Prisma.sql`${filmColumn(column)} = ANY(ARRAY[${Prisma.join(values)}])`;
}

function arrayOverlapPredicate(column: string, values: string[] | undefined): Prisma.Sql | undefined {
  if (!values || values.length === 0) return undefined;

  return Prisma.sql`${filmColumn(column)} && ARRAY[${Prisma.join(values)}]::TEXT[]`;
}

function exactValuePredicate(column: string, value: string | undefined): Prisma.Sql | undefined {
  if (!value) return undefined;

  return Prisma.sql`${filmColumn(column)} = ${value}`;
}

function tvTypePredicate(query: ListQuery): Prisma.Sql | undefined {
  if (!query.tvType) return undefined;

  return Prisma.sql`"Film"."tvType" ILIKE ${`%${query.tvType}%`}`;
}

function filmColumn(column: string): Prisma.Sql {
  return Prisma.raw(`"Film"."${column}"`);
}
