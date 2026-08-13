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
  //
  // People are folded in on the same term: the box says "Search films or
  // people", and `?search=kubrick` used to be a zero state while the dropdown
  // above it listed Stanley Kubrick — a dead end for every shared link in that
  // shape. Title hits still lead the ordering; person-only hits follow.
  return Prisma.sql`(
    "Film"."title" ILIKE ${`%${query.search}%`}
    OR ${personMatch(query, wordBoundary(query.search))}
  )`;
}

function personPredicate(query: ListQuery): Prisma.Sql | undefined {
  if (!query.person) return undefined;

  // `person` carries a whole name picked from the suggestion list, so it stays
  // a substring match — "Stanley Kubrick" has to find the raw credit line
  // "Stanley Kubrick, Producer" it was extracted from.
  return personMatch(query, Prisma.sql`ILIKE ${`%${query.person}%`}`);
}

/**
 * Everywhere a person's name is recorded — the director column, the cast list,
 * and the nominee on an award row — tested with one comparison so the two
 * callers cannot drift apart.
 */
function personMatch(query: ListQuery, comparison: Prisma.Sql): Prisma.Sql {
  return Prisma.sql`
    (
      "Film"."director" ${comparison}
      OR EXISTS (
        SELECT 1
        FROM jsonb_array_elements("Film"."cast") AS "castMember"
        WHERE "castMember"->>'name' ${comparison}
      )
      OR ${awardExists(query.awardBody, [
        Prisma.sql`(
          award->>'nominee' ${comparison}
        )`,
      ])}
    )
  `;
}

/**
 * Whole-word, case-insensitive. A free-text search must not drag in every
 * Danny Glover film because someone typed "love", so — unlike the exact name
 * in `person` — the term has to start and end a word in the name.
 */
function wordBoundary(search: string): Prisma.Sql {
  return Prisma.sql`~* ${`\\y${escapeRegex(search)}\\y`}`;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
