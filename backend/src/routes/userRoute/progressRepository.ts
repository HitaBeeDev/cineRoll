import type {
  CompletionCategoryKey,
  CompletionProgress,
  CompletionProgressCount,
} from "@cineroll/types";

import { prisma } from "../../lib/prisma";

type ProgressRow = {
  key: "overall" | CompletionCategoryKey;
  watched: bigint;
  total: bigint;
};

const CATEGORY_LABELS: Record<CompletionCategoryKey, string> = {
  oscar: "Oscar",
  goldenglobe: "Golden Globe",
  cannes: "Cannes",
  berlin: "Berlinale",
  "imdb-movies": "IMDb Top 250 Movies",
  "imdb-tv": "IMDb Top 250 TV",
};

const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS) as CompletionCategoryKey[];

export async function getUserProgress(userId: string): Promise<CompletionProgress> {
  const rows = await prisma.$queryRaw<ProgressRow[]>`
    WITH watched AS (
      SELECT "filmId"
      FROM "WatchedFilm"
      WHERE "userId" = ${userId}
    ),
    collections AS (
      SELECT 'oscar'::TEXT AS key, id AS "filmId"
      FROM "Film"
      WHERE "oscarNominations" > 0
      UNION ALL
      SELECT 'goldenglobe', id
      FROM "Film"
      WHERE "ggNominations" > 0
      UNION ALL
      SELECT 'cannes', id
      FROM "Film"
      WHERE "cannesNominations" > 0
      UNION ALL
      SELECT 'berlin', id
      FROM "Film"
      WHERE "berlinNominations" > 0
      UNION ALL
      SELECT 'imdb-movies', id
      FROM "Film"
      WHERE "imdbTopMovieRank" IS NOT NULL
      UNION ALL
      SELECT 'imdb-tv', id
      FROM "Film"
      WHERE "imdbTopTvRank" IS NOT NULL
    )
    SELECT
      'overall'::TEXT AS key,
      COUNT(watched."filmId")::BIGINT AS watched,
      COUNT("Film".id)::BIGINT AS total
    FROM "Film"
    LEFT JOIN watched ON watched."filmId" = "Film".id
    UNION ALL
    SELECT
      collections.key,
      COUNT(watched."filmId")::BIGINT AS watched,
      COUNT(*)::BIGINT AS total
    FROM collections
    LEFT JOIN watched ON watched."filmId" = collections."filmId"
    GROUP BY collections.key
  `;

  return progressPayload(rows);
}

export function progressPayload(rows: ProgressRow[]): CompletionProgress {
  const byKey = new Map(rows.map(row => [row.key, progressCount(row)]));

  return {
    overall: byKey.get("overall") ?? emptyCount(),
    categories: CATEGORY_ORDER.map(key => ({
      key,
      label: CATEGORY_LABELS[key],
      ...(byKey.get(key) ?? emptyCount()),
    })),
  };
}

function progressCount(row: Pick<ProgressRow, "watched" | "total">): CompletionProgressCount {
  const watched = Number(row.watched);
  const total = Number(row.total);

  return {
    watched,
    total,
    percentage: total === 0 ? 0 : Math.round((watched / total) * 1000) / 10,
  };
}

function emptyCount(): CompletionProgressCount {
  return { watched: 0, total: 0, percentage: 0 };
}
