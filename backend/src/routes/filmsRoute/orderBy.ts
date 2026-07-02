import { Prisma } from "@prisma/client";

import { ListQuery } from "../../lib/filmFilters/listQuerySchema";

export function filmListOrderBy(
  sort: ListQuery["sort"],
  sortOrder: ListQuery["sortOrder"],
  search?: ListQuery["search"],
): Prisma.Sql {
  const base = baseOrderBy(sort, sortOrder);

  // When the user is searching, relevance to the query leads and the chosen
  // sort (Awards / Rating / …) becomes the tiebreaker within a relevance tier.
  // That way the film you typed is always at the top, not whichever match
  // happens to have the most Oscars.
  if (!search) return base;

  return Prisma.sql`${titleRelevance(search)} DESC, ${base}`;
}

// Relevance tiers for a matched title (every row already contains the query as a
// substring — see textPredicates.ts): exact > prefix > whole-word > mid-string.
function titleRelevance(search: string): Prisma.Sql {
  const wordBoundary = `\\y${escapeRegex(search)}\\y`;

  return Prisma.sql`
    CASE
      WHEN lower("Film"."title") = lower(${search}) THEN 4
      WHEN lower("Film"."title") LIKE lower(${search}) || '%' THEN 3
      WHEN "Film"."title" ~* ${wordBoundary} THEN 2
      ELSE 1
    END
  `;
}

// Escape regex metacharacters so a query like "Se7en" or "M*A*S*H" matches
// literally in the `~*` word-boundary test instead of as a pattern.
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function baseOrderBy(
  sort: ListQuery["sort"],
  sortOrder: ListQuery["sortOrder"],
): Prisma.Sql {
  const dir = sortOrder === "asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`;
  const dirOpp = sortOrder === "asc" ? Prisma.sql`DESC` : Prisma.sql`ASC`;

  if (sort === "title") {
    return Prisma.sql`"Film"."title" ${dir}, "Film"."year" ${dirOpp}`;
  }

  if (sort === "rating") {
    return Prisma.sql`"Film"."imdbRating" ${dir} NULLS LAST, "Film"."year" ${dirOpp}, "Film"."title" ASC`;
  }

  if (sort === "rt") {
    return Prisma.sql`"Film"."rtScore" ${dir} NULLS LAST, "Film"."year" ${dirOpp}, "Film"."title" ASC`;
  }

  if (sort === "awards") {
    return Prisma.sql`
      (
        "Film"."oscarWins"
        + "Film"."ggWins"
        + "Film"."cannesWins"
        + "Film"."berlinWins"
      ) ${dir},
      (
        "Film"."oscarNominations"
        + "Film"."ggNominations"
        + "Film"."cannesNominations"
        + "Film"."berlinNominations"
      ) ${dir},
      "Film"."title" ASC
    `;
  }

  return Prisma.sql`"Film"."year" ${dir}, "Film"."title" ASC`;
}
