import { prisma } from "../../lib/prisma";
import { SurfaceRow } from "./types";

export function getRecommendationMetricRows(since: Date | null): Promise<SurfaceRow[]> {
  return prisma.$queryRaw<SurfaceRow[]>`
    WITH served AS (
      SELECT
        COALESCE(e."userId", e."anonId") AS actor,
        e."filmId" AS film_id,
        COALESCE(e.context->>'source', 'recommender') AS surface,
        e."createdAt" AS served_at
      FROM "Event" e
      WHERE e.type = 'recommendation_served'
        AND e."filmId" IS NOT NULL
        AND (${since}::timestamptz IS NULL OR e."createdAt" >= ${since})

      UNION ALL

      SELECT
        COALESCE(e."userId", e."anonId") AS actor,
        fid AS film_id,
        COALESCE(e.context->>'source', 'recommender') AS surface,
        e."createdAt" AS served_at
      FROM "Event" e,
        jsonb_array_elements_text(e.context->'filmIds') AS fid
      WHERE e.type = 'recommendation_served'
        AND e."filmId" IS NULL
        AND jsonb_typeof(e.context->'filmIds') = 'array'
        AND (${since}::timestamptz IS NULL OR e."createdAt" >= ${since})
    ),
    imp AS (
      SELECT actor, film_id, surface, MIN(served_at) AS served_at
      FROM served
      WHERE actor IS NOT NULL AND film_id IS NOT NULL
      GROUP BY actor, film_id, surface
    )
    SELECT
      i.surface,
      COUNT(*)::bigint AS served,
      COUNT(*) FILTER (WHERE EXISTS (
        SELECT 1 FROM "Event" e WHERE e.type = 'recommendation_click'
          AND COALESCE(e."userId", e."anonId") = i.actor
          AND e."filmId" = i.film_id AND e."createdAt" >= i.served_at
      ))::bigint AS clicked,
      COUNT(*) FILTER (WHERE EXISTS (
        SELECT 1 FROM "Event" e WHERE e.type = 'watchlist_add'
          AND COALESCE(e."userId", e."anonId") = i.actor
          AND e."filmId" = i.film_id AND e."createdAt" >= i.served_at
      ))::bigint AS saved,
      COUNT(*) FILTER (WHERE EXISTS (
        SELECT 1 FROM "Event" e WHERE e.type = 'watched'
          AND COALESCE(e."userId", e."anonId") = i.actor
          AND e."filmId" = i.film_id AND e."createdAt" >= i.served_at
      ))::bigint AS watched,
      COUNT(*) FILTER (WHERE EXISTS (
        SELECT 1 FROM "Event" e WHERE e.type = 'not_interested'
          AND COALESCE(e."userId", e."anonId") = i.actor
          AND e."filmId" = i.film_id AND e."createdAt" >= i.served_at
      ))::bigint AS disliked
    FROM imp i
    GROUP BY i.surface
    ORDER BY served DESC
  `;
}
