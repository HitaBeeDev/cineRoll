import { Prisma } from "@prisma/client";

import { prisma } from "../../../lib/prisma";
import type { ReferenceFilm } from "./referenceTypes";

// Substring match on title and originalTitle, mirroring the deliberate choice in
// textPredicates.ts to use ILIKE rather than the pg_trgm fuzzy operator: loose
// look-alikes read as noise, and anchoring a whole recommendation on the wrong
// film is worse than admitting the title wasn't found. "john wick" still finds
// "John Wick: Chapter 4"; "The Godfather Part 2" will not find "Part II".
export const findReferenceFilm = async (title: string): Promise<ReferenceFilm | null> => {
  const like = `%${title}%`;
  const prefix = `${title}%`;

  const rows = await prisma.$queryRaw<ReferenceFilm[]>(Prisma.sql`
    SELECT
      "Film"."id",
      "Film"."slug",
      "Film"."title",
      "Film"."year",
      "Film"."director",
      "Film"."genres",
      "Film"."moodTags",
      "Film"."keywords",
      "Film"."oscarCategories",
      "Film"."ggCategories",
      "Film"."cannesCategories"
    FROM "Film"
    WHERE "Film"."title" ILIKE ${like} OR "Film"."originalTitle" ILIKE ${like}
    ORDER BY
      CASE
        WHEN LOWER("Film"."title") = LOWER(${title}) THEN 0
        WHEN "Film"."title" ILIKE ${prefix} THEN 1
        ELSE 2
      END,
      COALESCE("Film"."imdbRating", 0) DESC,
      "Film"."year" ASC
    LIMIT 1
  `);

  return rows[0] ?? null;
};
