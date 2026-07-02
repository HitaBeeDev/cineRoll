import { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma";
import { randomSelect } from "../randomRoute/selects";
import { RandomFilmRow } from "../randomRoute/types";

// A blind-roll target (and every decoy) must be a real "case": it has a poster,
// at least one genre, and an award trail to reason about. Older award films
// often lack an RT score, so — unlike the main roll gate — ratings are not
// required here; the award trail is the point.
const ELIGIBLE = Prisma.sql`
  "Film"."posterUrl" IS NOT NULL
  AND array_length("Film"."genres", 1) >= 1
  AND (
    "Film"."oscarNominations" + "Film"."oscarWins"
    + "Film"."ggNominations" + "Film"."ggWins"
    + "Film"."cannesNominations" + "Film"."cannesWins"
  ) > 0
`;

export async function getRandomTarget(): Promise<RandomFilmRow | null> {
  const rows = await prisma.$queryRaw<RandomFilmRow[]>(Prisma.sql`
    SELECT ${randomSelect}
    FROM "Film"
    WHERE ${ELIGIBLE}
    ORDER BY RANDOM()
    LIMIT 1
  `);

  return rows[0] ?? null;
}

export async function getTargetBySlug(slug: string): Promise<RandomFilmRow | null> {
  const rows = await prisma.$queryRaw<RandomFilmRow[]>(Prisma.sql`
    SELECT ${randomSelect}
    FROM "Film"
    WHERE "Film"."slug" = ${slug}
    LIMIT 1
  `);

  return rows[0] ?? null;
}

// The plausible-decoy universe: eligible films from the target's own decade — so
// the visible decade clue can't trivially eliminate them. Broadens to the whole
// catalog only when the decade is too thin to choose from.
export async function getDistractorPool(
  target: RandomFilmRow,
  limit: number,
  minDecadePool: number,
): Promise<RandomFilmRow[]> {
  const decadeStart = Math.floor(target.releaseYear / 10) * 10;

  const sameDecade = await prisma.$queryRaw<RandomFilmRow[]>(Prisma.sql`
    SELECT ${randomSelect}
    FROM "Film"
    WHERE ${ELIGIBLE}
      AND "Film"."id" <> ${target.id}
      AND "Film"."year" >= ${decadeStart}
      AND "Film"."year" < ${decadeStart + 10}
    ORDER BY RANDOM()
    LIMIT ${limit}
  `);

  if (sameDecade.length >= minDecadePool) return sameDecade;

  const broader = await prisma.$queryRaw<RandomFilmRow[]>(Prisma.sql`
    SELECT ${randomSelect}
    FROM "Film"
    WHERE ${ELIGIBLE}
      AND "Film"."id" <> ${target.id}
    ORDER BY RANDOM()
    LIMIT ${limit}
  `);

  const seen = new Set(sameDecade.map(film => film.id));
  return [...sameDecade, ...broader.filter(film => !seen.has(film.id))];
}
