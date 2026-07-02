import { Prisma } from "@prisma/client";

import { awardExists } from "./awardSql";
import { FEMALE_DIRECTORS } from "./constants";
import { ListQuery } from "./listQuerySchema";

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

  // Substring match only. The pg_trgm fuzzy operator (`title % search`) was
  // dropped deliberately: it pulled in loose look-alikes ("Lethal Weapon" for
  // "Weapons") that read as noise. A title now matches only if it actually
  // contains the query; relevance ordering (see orderBy.ts) then floats exact
  // and prefix hits above mid-string ones. Trade-off: no typo tolerance here.
  return Prisma.sql`"Film"."title" ILIKE ${`%${query.search}%`}`;
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
