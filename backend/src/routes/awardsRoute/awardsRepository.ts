import { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma";
import { AWARD_BODIES, type AwardBodySlug } from "./awardBodies";

/** One nomination: a film, the category, the year, and whether it won. */
export type AwardRow = {
  filmId: string;
  slug: string;
  title: string;
  releaseYear: number | null;
  posterUrl: string | null;
  genres: string[];
  category: string;
  awardYear: number;
  won: boolean;
  nominee: string | null;
};

/** Every nomination recorded for one award body, across all years. */
export function findAwardRows(body: AwardBodySlug): Promise<AwardRow[]> {
  // The column comes from the fixed AWARD_BODIES map, never from user input.
  const column = Prisma.raw(`"${AWARD_BODIES[body].column}"`);

  return prisma.$queryRaw<AwardRow[]>`
    SELECT
      f."id" AS "filmId",
      f."slug",
      f."title",
      f."year" AS "releaseYear",
      f."posterUrl",
      f."genres",
      award->>'category' AS category,
      (award->>'awardYear')::INT AS "awardYear",
      COALESCE((award->>'won')::BOOLEAN, FALSE) AS won,
      NULLIF(NULLIF(award->>'nominee', ''), 'NaN') AS nominee
    FROM "Film" f, jsonb_array_elements(f.${column}) AS award
    WHERE award->>'category' IS NOT NULL
      AND award->>'category' <> ''
      AND award->>'awardYear' ~ '^[0-9]{4}$'
  `;
}
