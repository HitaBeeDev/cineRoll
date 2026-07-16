import { Prisma } from "@prisma/client";

import { prisma } from "../../lib/prisma";
import {
  DecadeTopFilmRow,
  FILM_RECORD_TYPES,
  FilmRecordRowsByType,
  FilmRecordType,
  FilmStatRow,
} from "./types";

// Top 3 powers the Hall of Records podium; the hero reel uses the [0] entry.
// Tie-breaks mirror the /browse "awards" sort so the two pages stay consistent.
export function getTopNominatedFilmRows(): Promise<FilmStatRow[]> {
  return prisma.$queryRaw<FilmStatRow[]>`
    SELECT "id", "slug", "title", "year" AS "releaseYear", "posterUrl",
      ("oscarNominations" + "ggNominations" + "cannesNominations" + "berlinNominations")::BIGINT AS count
    FROM "Film"
    ORDER BY
      count DESC,
      ("oscarWins" + "ggWins" + "cannesWins" + "berlinWins") DESC,
      "title" ASC
    LIMIT 3
  `;
}

export function getTopWinningFilmRows(): Promise<FilmStatRow[]> {
  return prisma.$queryRaw<FilmStatRow[]>`
    SELECT "id", "slug", "title", "year" AS "releaseYear", "posterUrl",
      ("oscarWins" + "ggWins" + "cannesWins" + "berlinWins")::BIGINT AS count
    FROM "Film"
    ORDER BY
      count DESC,
      ("oscarNominations" + "ggNominations" + "cannesNominations" + "berlinNominations") DESC,
      "title" ASC
    LIMIT 3
  `;
}

// Bucket conditions for the per-type Hall of Records. `types` is the derived
// facet set from deriveFilmTypes() (a film can be documentary AND short);
// series stay on contentType, the single-valued media namespace.
const FILM_RECORD_TYPE_CONDITIONS: Record<FilmRecordType, Prisma.Sql> = {
  movie: Prisma.sql`"types" @> ARRAY['movie']::TEXT[]`,
  series: Prisma.sql`"contentType" IN ('tv-series', 'tv-mini-series')`,
  documentary: Prisma.sql`"types" @> ARRAY['documentary']::TEXT[]`,
  animation: Prisma.sql`"types" @> ARRAY['animation']::TEXT[]`,
  short: Prisma.sql`"types" @> ARRAY['short']::TEXT[]`,
};

// Same podium queries as the global Hall of Records, scoped to one type bucket.
// Zero-count rows are excluded so a sparse bucket shows fewer cards, not
// meaningless "0 wins" record holders.
function topWinningRowsFor(condition: Prisma.Sql): Promise<FilmStatRow[]> {
  return prisma.$queryRaw<FilmStatRow[]>`
    SELECT "id", "slug", "title", "year" AS "releaseYear", "posterUrl",
      ("oscarWins" + "ggWins" + "cannesWins" + "berlinWins")::BIGINT AS count
    FROM "Film"
    WHERE ${condition}
      AND ("oscarWins" + "ggWins" + "cannesWins" + "berlinWins") > 0
    ORDER BY
      count DESC,
      ("oscarNominations" + "ggNominations" + "cannesNominations" + "berlinNominations") DESC,
      "title" ASC
    LIMIT 3
  `;
}

function topNominatedRowsFor(condition: Prisma.Sql): Promise<FilmStatRow[]> {
  return prisma.$queryRaw<FilmStatRow[]>`
    SELECT "id", "slug", "title", "year" AS "releaseYear", "posterUrl",
      ("oscarNominations" + "ggNominations" + "cannesNominations" + "berlinNominations")::BIGINT AS count
    FROM "Film"
    WHERE ${condition}
      AND ("oscarNominations" + "ggNominations" + "cannesNominations" + "berlinNominations") > 0
    ORDER BY
      count DESC,
      ("oscarWins" + "ggWins" + "cannesWins" + "berlinWins") DESC,
      "title" ASC
    LIMIT 3
  `;
}

export async function getFilmRecordRowsByType(): Promise<FilmRecordRowsByType> {
  const entries = await Promise.all(
    FILM_RECORD_TYPES.map(async type => {
      const condition = FILM_RECORD_TYPE_CONDITIONS[type];
      const [winning, nominated] = await Promise.all([
        topWinningRowsFor(condition),
        topNominatedRowsFor(condition),
      ]);
      return [type, { winning, nominated }] as const;
    }),
  );

  return Object.fromEntries(entries) as FilmRecordRowsByType;
}

// Most-nominated film per decade — feeds the timeline hover reveal.
export function getDecadeTopFilmRows(): Promise<DecadeTopFilmRow[]> {
  return prisma.$queryRaw<DecadeTopFilmRow[]>`
    SELECT DISTINCT ON (FLOOR("year" / 10) * 10)
      FLOOR("year" / 10) * 10 AS decade,
      "title",
      "slug",
      ("oscarNominations" + "ggNominations" + "cannesNominations" + "berlinNominations")::BIGINT AS count
    FROM "Film"
    WHERE "year" IS NOT NULL AND "year" >= 1920
    ORDER BY
      FLOOR("year" / 10) * 10,
      ("oscarNominations" + "ggNominations" + "cannesNominations" + "berlinNominations") DESC,
      "title" ASC
  `;
}

export function getTopRolledRows(): Promise<FilmStatRow[]> {
  return prisma.$queryRaw<FilmStatRow[]>`
    SELECT f."id", f."slug", f."title", f."year" AS "releaseYear", f."posterUrl",
      COUNT(*)::BIGINT AS count
    FROM "RollEvent" r
    JOIN "Film" f ON f."id" = r."filmId"
    GROUP BY f."id", f."slug", f."title", f."year", f."posterUrl"
    ORDER BY count DESC
    LIMIT 5
  `;
}

export function getTopWatchlistedRows(useWatchlist: boolean): Promise<FilmStatRow[]> {
  if (!useWatchlist) return Promise.resolve([]);

  return prisma.$queryRaw<FilmStatRow[]>`
    SELECT f."id", f."slug", f."title", f."year" AS "releaseYear", f."posterUrl",
      COUNT(*)::BIGINT AS count
    FROM "WatchlistEntry" w
    JOIN "Film" f ON f."id" = w."filmId"
    GROUP BY f."id", f."slug", f."title", f."year", f."posterUrl"
    ORDER BY count DESC
    LIMIT 5
  `;
}
