import { Prisma } from "@prisma/client";

import { AWARD_BODY_VALUES, AwardBodyValue } from "../../lib/filmFilters/constants";
import { ListQuery } from "../../lib/filmFilters/listQuerySchema";

// Win / nomination columns per award body, so the "Awards" sort can be scoped to
// whichever bodies the browse filter selects.
const AWARD_WIN_COLUMN: Record<AwardBodyValue, Prisma.Sql> = {
  oscar:       Prisma.sql`"Film"."oscarWins"`,
  goldenglobe: Prisma.sql`"Film"."ggWins"`,
  cannes:      Prisma.sql`"Film"."cannesWins"`,
  berlin:      Prisma.sql`"Film"."berlinWins"`,
};
const AWARD_NOM_COLUMN: Record<AwardBodyValue, Prisma.Sql> = {
  oscar:       Prisma.sql`"Film"."oscarNominations"`,
  goldenglobe: Prisma.sql`"Film"."ggNominations"`,
  cannes:      Prisma.sql`"Film"."cannesNominations"`,
  berlin:      Prisma.sql`"Film"."berlinNominations"`,
};

export function filmListOrderBy(
  sort: ListQuery["sort"],
  sortOrder: ListQuery["sortOrder"],
  search?: ListQuery["search"],
  awardBodies: AwardBodyValue[] = [],
): Prisma.Sql {
  const base = baseOrderBy(sort, sortOrder, awardBodies);

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
  awardBodies: AwardBodyValue[],
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
    // Scope the award count to the selected bodies so that filtering (e.g.)
    // Golden Globe ranks by Golden Globe wins — La La Land's 7 leads Titanic's 4
    // — instead of by the all-body total. No body selected → sum every body.
    const scope = awardBodies.length > 0 ? awardBodies : [...AWARD_BODY_VALUES];
    const winsSum = Prisma.join(scope.map(body => AWARD_WIN_COLUMN[body]), " + ");
    const nomsSum = Prisma.join(scope.map(body => AWARD_NOM_COLUMN[body]), " + ");
    return Prisma.sql`
      (${winsSum}) ${dir},
      (${nomsSum}) ${dir},
      "Film"."title" ASC
    `;
  }

  return Prisma.sql`"Film"."year" ${dir}, "Film"."title" ASC`;
}
