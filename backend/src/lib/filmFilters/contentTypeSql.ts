import { Prisma } from "@prisma/client";

/** The type whose presence makes a film a short, on the length axis. */
const SHORT_TYPE = "short";
/** The type that reads to a user as "feature film", not "any theatrical release". */
const FEATURE_TYPE = "movie";

/**
 * One content-type facet value as SQL over the derived `types` array.
 *
 * `types` crosses two axes — kind (movie | documentary | animation) and length
 * (short) — so a 14-minute fiction short derives `["movie","short"]`. A plain
 * overlap on "movie" therefore hands back shorts alongside features, and the
 * Movie facet returned ~1 short in every 4 rows. "Movie" is a sibling chip of
 * "Short" in the same group, so it has to mean the feature: the length axis is
 * excluded here, in the one place both the browse facets and the Hall of Records
 * buckets resolve, rather than in WHERE fragments that can drift apart.
 *
 * Only "movie" carries the exclusion. Documentary and Animation keep both
 * lengths, because a documentary short is still a documentary and the group has
 * no "Documentary feature" chip to contrast it with.
 */
export function contentTypeSql(typesColumn: Prisma.Sql, value: string): Prisma.Sql {
  const overlap = Prisma.sql`${typesColumn} && ARRAY[${value}]::TEXT[]`;
  if (value !== FEATURE_TYPE) return overlap;

  return Prisma.sql`(${overlap} AND NOT ${typesColumn} && ARRAY[${SHORT_TYPE}]::TEXT[])`;
}
