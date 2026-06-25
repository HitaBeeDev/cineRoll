import { Prisma } from "@prisma/client";

import { ListQuery } from "../../lib/filmFilters/listQuerySchema";

export function filmListOrderBy(
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
