import { Prisma } from "@prisma/client";

import { contentTypeSql } from "./contentTypeSql";
import { ListQuery } from "./listQuerySchema";

export function facetPredicates(query: ListQuery): Prisma.Sql[] {
  return [
    contentTypePredicate(query.contentType),
    equalsAnyPredicate("language", query.language),
    // Origin, not co-financing: `countries` holds every country that put money in, which
    // filed Norwegian "Sentimental Value" under Turkey. That list stays for display.
    arrayOverlapPredicate("originCountries", query.country),
    arrayOverlapPredicate("genres", query.genre),
    arrayContainsPredicate("genres", query.genreAll),
    exactValuePredicate("certificate", query.certificate),
    tvTypePredicate(query),
  ].filter((predicate): predicate is Prisma.Sql => predicate !== undefined);
}

/**
 * A film carries a SET of types ("documentary" + "short"), so each requested
 * value is matched by overlap and the arms are OR'd — picking Movie + Short
 * still returns features and shorts alike. The per-value rules (notably that
 * "movie" means the feature) live in `contentTypeSql`.
 */
function contentTypePredicate(values: string[] | undefined): Prisma.Sql | undefined {
  if (!values || values.length === 0) return undefined;

  const arms = values.map(value => contentTypeSql(filmColumn("types"), value));
  return Prisma.sql`(${Prisma.join(arms, " OR ")})`;
}

function equalsAnyPredicate(column: string, values: string[] | undefined): Prisma.Sql | undefined {
  if (!values || values.length === 0) return undefined;

  return Prisma.sql`${filmColumn(column)} = ANY(ARRAY[${Prisma.join(values)}])`;
}

function arrayOverlapPredicate(column: string, values: string[] | undefined): Prisma.Sql | undefined {
  if (!values || values.length === 0) return undefined;

  return Prisma.sql`${filmColumn(column)} && ARRAY[${Prisma.join(values)}]::TEXT[]`;
}

// AND semantics: the film's array must contain every requested value.
function arrayContainsPredicate(column: string, values: string[] | undefined): Prisma.Sql | undefined {
  if (!values || values.length === 0) return undefined;

  return Prisma.sql`${filmColumn(column)} @> ARRAY[${Prisma.join(values)}]::TEXT[]`;
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
