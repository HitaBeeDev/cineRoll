import { prisma } from "../../lib/prisma";
import { RollRow } from "./types";

export function getRollMetricRows(since: Date | null): Promise<RollRow[]> {
  return prisma.$queryRaw<RollRow[]>`
    WITH rolled AS (
      SELECT
        COALESCE(e."userId", e."anonId") AS actor,
        e."filmId" AS film_id,
        CASE WHEN e.type = 'roll_personalized' THEN 'personalized' ELSE 'random' END AS variant,
        MIN(e."createdAt") AS rolled_at
      FROM "Event" e
      WHERE e.type IN ('roll', 'roll_personalized')
        AND e."filmId" IS NOT NULL
        AND COALESCE(e."userId", e."anonId") IS NOT NULL
        AND (${since}::timestamptz IS NULL OR e."createdAt" >= ${since})
      GROUP BY actor, film_id, variant
    )
    SELECT
      r.variant,
      COUNT(*)::bigint AS rolled,
      COUNT(*) FILTER (WHERE EXISTS (
        SELECT 1 FROM "Event" e WHERE e.type = 'film_click'
          AND COALESCE(e."userId", e."anonId") = r.actor
          AND e."filmId" = r.film_id AND e."createdAt" >= r.rolled_at
      ))::bigint AS clicked,
      COUNT(*) FILTER (WHERE EXISTS (
        SELECT 1 FROM "Event" e WHERE e.type = 'watchlist_add'
          AND COALESCE(e."userId", e."anonId") = r.actor
          AND e."filmId" = r.film_id AND e."createdAt" >= r.rolled_at
      ))::bigint AS saved,
      COUNT(*) FILTER (WHERE EXISTS (
        SELECT 1 FROM "Event" e WHERE e.type = 'watched'
          AND COALESCE(e."userId", e."anonId") = r.actor
          AND e."filmId" = r.film_id AND e."createdAt" >= r.rolled_at
      ))::bigint AS watched
    FROM rolled r
    GROUP BY r.variant
  `;
}
