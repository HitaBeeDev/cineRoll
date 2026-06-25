import { Prisma } from "@prisma/client";

import { awardExists } from "./awardSql";
import { FEMALE_DIRECTORS } from "./constants";
import { ListQuery } from "./querySchemas";

export function textPredicates(query: ListQuery): Prisma.Sql[] {
  return [
    titleSearchPredicate(query),
    personPredicate(query),
    directorPredicate(query),
    femaleDirectorPredicate(query),
  ].filter((predicate): predicate is Prisma.Sql => predicate !== undefined);
}

function titleSearchPredicate(query: ListQuery): Prisma.Sql | undefined {
  if (!query.search) return undefined;

  const searchLike = `%${query.search}%`;
  return Prisma.sql`
    (
      "Film"."title" ILIKE ${searchLike}
      OR "Film"."title" % ${query.search}
    )
  `;
}

function personPredicate(query: ListQuery): Prisma.Sql | undefined {
  if (!query.person) return undefined;

  const personLike = `%${query.person}%`;
  return Prisma.sql`
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
  `;
}

function directorPredicate(query: ListQuery): Prisma.Sql | undefined {
  if (!query.director) return undefined;

  return Prisma.sql`"Film"."director" ILIKE ${`%${query.director}%`}`;
}

function femaleDirectorPredicate(query: ListQuery): Prisma.Sql | undefined {
  if (query.femaleDirectorOnly !== true) return undefined;

  return Prisma.sql`(
    ${Prisma.join(
      FEMALE_DIRECTORS.map(name => Prisma.sql`"Film"."director" ILIKE ${`%${name}%`}`),
      " OR ",
    )}
  )`;
}
