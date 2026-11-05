import { prisma } from "../../lib/prisma";
import type { AwardCreditRow, DirectedFilm, PersonCreditIndex } from "./personCreditTypes";

type CreditJoinRow = AwardCreditRow & { personSlug: string };
type DirectorJoinRow = DirectedFilm & { personSlug: string };
type PersonRow = { slug: string; name: string; status: string };

/**
 * The person index from the Credit tables written by `link-credits --apply`:
 * every person, their award rows (all four bodies, Berlinale included), the
 * films they directed, their alias slugs, and which are verified. Same shape
 * as the legacy index, so person pages, cast links and the sitemap read it
 * unchanged. Null while the tables are empty (before the first apply, or
 * between a seed and the re-link) — the caller then falls back to parsing.
 */
export async function loadPersonCreditIndexFromTables(): Promise<PersonCreditIndex | null> {
  // Code can ship before the migration is applied: a missing table means "not
  // linked yet", exactly like an empty one, and person pages keep working.
  const row = await prisma.$queryRaw<{ count: number }[]>`SELECT COUNT(*)::INT AS count FROM "Credit"`
    .then(rows => rows[0])
    .catch(() => undefined);
  if (!row?.count) return null;

  const [people, creditRows, directorRows, aliasRows] = await Promise.all([
    prisma.$queryRaw<PersonRow[]>`
      SELECT p."slug", p."name", p."status" FROM "Person" p
      WHERE EXISTS (SELECT 1 FROM "CreditPerson" cp WHERE cp."personId" = p."id")
         OR EXISTS (SELECT 1 FROM "FilmDirector" fd WHERE fd."personId" = p."id")
    `,
    prisma.$queryRaw<CreditJoinRow[]>`
      SELECT p."slug" AS "personSlug", c."body", f."id" AS "filmId", f."slug" AS "filmSlug", f."title" AS "filmTitle",
             f."year" AS "releaseYear", f."posterUrl", f."imdbRating", f."updatedAt" AS "filmUpdatedAt",
             c."nominee", c."category", c."awardYear", c."won"
      FROM "CreditPerson" cp
      JOIN "Credit" c ON c."id" = cp."creditId"
      JOIN "Film" f ON f."id" = c."filmId"
      JOIN "Person" p ON p."id" = cp."personId"
    `,
    prisma.$queryRaw<DirectorJoinRow[]>`
      SELECT p."slug" AS "personSlug", f."id", f."slug", f."title", f."year" AS "releaseYear", f."posterUrl", f."imdbRating"
      FROM "FilmDirector" fd
      JOIN "Film" f ON f."id" = fd."filmId"
      JOIN "Person" p ON p."id" = fd."personId"
      ORDER BY f."year" DESC
    `,
    prisma.$queryRaw<{ slug: string; personSlug: string }[]>`
      SELECT a."slug", p."slug" AS "personSlug" FROM "PersonAlias" a JOIN "Person" p ON p."id" = a."personId"
    `,
  ]);

  const credits = new Map<string, AwardCreditRow[]>();
  for (const { personSlug, ...row } of creditRows) {
    const list = credits.get(personSlug);
    if (list) list.push(row);
    else credits.set(personSlug, [row]);
  }

  const directed = new Map<string, DirectedFilm[]>();
  for (const { personSlug, ...film } of directorRows) {
    const list = directed.get(personSlug);
    if (list) list.push(film);
    else directed.set(personSlug, [film]);
  }

  return {
    names: new Map(people.map(person => [person.slug, person.name])),
    credits,
    directed,
    aliases: new Map(aliasRows.map(alias => [alias.slug, alias.personSlug])),
    verified: new Set(people.filter(person => person.status === "verified").map(person => person.slug)),
  };
}
