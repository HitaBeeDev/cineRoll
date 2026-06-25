import { Prisma } from "@prisma/client";

import { FEMALE_DIRECTORS } from "./constants";
import { awardExists, awardFilter } from "./awardSql";
import { ListQuery } from "./querySchemas";

export function buildWhereClause(
  query: ListQuery,
  additionalConditions: Prisma.Sql[] = [],
): Prisma.Sql {
  const where: Prisma.Sql[] = [...additionalConditions];

  if (query.search) {
    const searchLike = `%${query.search}%`;
    where.push(Prisma.sql`
      (
        "Film"."title" ILIKE ${searchLike}
        OR "Film"."title" % ${query.search}
      )
    `);
  }

  if (query.person) {
    const personLike = `%${query.person}%`;
    where.push(Prisma.sql`
      (
        "Film"."director" ILIKE ${personLike}
        OR EXISTS (
          SELECT 1
          FROM jsonb_array_elements("Film"."cast") AS "castMember"
          WHERE "castMember"->>'name' ILIKE ${personLike}
        )
        OR ${awardExists(query.awardBody, [
          Prisma.sql`(
            award->>'nominee' ILIKE ${personLike}
          )`,
        ])}
      )
    `);
  }

  if (query.director) {
    where.push(Prisma.sql`"Film"."director" ILIKE ${`%${query.director}%`}`);
  }

  if (query.femaleDirectorOnly === true) {
    where.push(Prisma.sql`(
      ${Prisma.join(
        FEMALE_DIRECTORS.map(name => Prisma.sql`"Film"."director" ILIKE ${`%${name}%`}`),
        " OR ",
      )}
    )`);
  }

  if (query.contentType && query.contentType.length > 0) {
    where.push(Prisma.sql`"Film"."contentType" = ANY(ARRAY[${Prisma.join(query.contentType)}])`);
  }

  if (query.language && query.language.length > 0) {
    where.push(Prisma.sql`"Film"."language" = ANY(ARRAY[${Prisma.join(query.language)}])`);
  }

  // Array-overlap (`&&`): the film qualifies if it has any of the selected
  // countries/genres, OR within the facet (was single-element containment `@>`).
  if (query.country && query.country.length > 0) {
    where.push(Prisma.sql`"Film"."countries" && ARRAY[${Prisma.join(query.country)}]::TEXT[]`);
  }

  if (query.genre && query.genre.length > 0) {
    where.push(Prisma.sql`"Film"."genres" && ARRAY[${Prisma.join(query.genre)}]::TEXT[]`);
  }

  if (query.runtimeMax !== undefined) {
    where.push(Prisma.sql`"Film"."runtime" IS NOT NULL`);
    where.push(Prisma.sql`"Film"."runtime" <= ${query.runtimeMax}`);
  }

  if (query.decadeMin !== undefined) {
    where.push(Prisma.sql`"Film"."year" >= ${query.decadeMin}`);
  }

  if (query.decadeMax !== undefined) {
    where.push(Prisma.sql`"Film"."year" <= ${query.decadeMax}`);
  }

  if (query.imdbRatingMin !== undefined) {
    where.push(Prisma.sql`"Film"."imdbRating" IS NOT NULL`);
    where.push(Prisma.sql`"Film"."imdbRating" >= ${query.imdbRatingMin}`);
  }

  if (query.imdbRatingMax !== undefined) {
    where.push(Prisma.sql`"Film"."imdbRating" IS NOT NULL`);
    where.push(Prisma.sql`"Film"."imdbRating" <= ${query.imdbRatingMax}`);
  }

  if (query.rtScoreMin !== undefined) {
    where.push(Prisma.sql`"Film"."rtScore" IS NOT NULL`);
    where.push(Prisma.sql`"Film"."rtScore" >= ${query.rtScoreMin}`);
  }

  if (query.nominationCount !== undefined) {
    // Treated as a minimum ("at least N total nominations"), the natural,
    // useful reading for a filter, vs. an exact match that almost never hits.
    where.push(Prisma.sql`
      (
        "Film"."oscarNominations"
        + "Film"."ggNominations"
        + "Film"."cannesNominations"
        + "Film"."berlinNominations"
      ) >= ${query.nominationCount}
    `);
  }

  if (query.certificate) {
    where.push(Prisma.sql`"Film"."certificate" = ${query.certificate}`);
  }

  if (query.imdbTopMoviesOnly === true) {
    where.push(Prisma.sql`"Film"."imdbTopMovieRank" IS NOT NULL`);
  }

  if (query.imdbTopTvOnly === true) {
    where.push(Prisma.sql`"Film"."imdbTopTvRank" IS NOT NULL`);
  }

  if (query.tvType) {
    where.push(Prisma.sql`"Film"."tvType" ILIKE ${`%${query.tvType}%`}`);
  }

  const awards = awardFilter(query);
  if (awards) {
    where.push(awards);
  }

  return where.length > 0
    ? Prisma.sql`WHERE ${Prisma.join(where, " AND ")}`
    : Prisma.empty;
}
