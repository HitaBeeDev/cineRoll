import { Router, type NextFunction, type Request, type Response } from "express";
import { z } from "zod";
import { config } from "../config";
import { prisma } from "../lib/prisma";
import { HttpError } from "../middleware/errorHandler";
import { getValidated, validate } from "../middleware/validate";

export const metricsRouter = Router();

// Ops-only endpoint. Disabled (503) unless METRICS_TOKEN is configured, then
// gated behind a bearer token rather than user auth — these are aggregate
// product metrics, not per-user data.
function requireMetricsToken(req: Request, _res: Response, next: NextFunction) {
  if (!config.metricsToken) {
    throw new HttpError(503, "Metrics are not enabled", "METRICS_DISABLED");
  }
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : null;
  if (!token || token !== config.metricsToken) {
    throw new HttpError(401, "Unauthorized", "INVALID_METRICS_TOKEN");
  }
  next();
}

metricsRouter.use(requireMetricsToken);

const querySchema = z.object({
  // Lookback window in days; omit for all-time.
  days: z.coerce.number().int().min(1).max(365).optional(),
});

type SurfaceRow = {
  surface: string;
  served: bigint;
  clicked: bigint;
  saved: bigint;
  watched: bigint;
  disliked: bigint;
};

const toNum = (v: bigint | number | null | undefined) => Number(v ?? 0);
const rate = (numerator: number, denominator: number) =>
  denominator === 0 ? 0 : Math.round((numerator / denominator) * 1e4) / 1e4;

function shape(served: number, clicked: number, saved: number, watched: number, disliked: number) {
  return {
    served,
    clicked,
    saved,
    watched,
    disliked,
    ctr: rate(clicked, served),
    saveRate: rate(saved, served),
    watchedRate: rate(watched, served),
    dislikeRate: rate(disliked, served),
  };
}

// GET /api/metrics/recommendations?days=30
//
// Recommendation funnel from the Event table. An impression is one
// (actor, film, surface) that was served — actor = userId or, for anonymous
// traffic, anonId. Served events come in two shapes: per-film (natural roll,
// carries context.source) and batched (the /recommendations recommender,
// carries context.filmIds). Downstream save/watched/dislike have no
// rec-specific event type, so they are attributed by post-impression match:
// the same actor acting on the same film at or after it was served to them.
// CTR uses the explicit recommendation_click signal. All rates share the
// served denominator, so they are directly comparable.
metricsRouter.get("/recommendations", validate(querySchema, "query"), async (req, res) => {
  const { days } = getValidated<z.infer<typeof querySchema>>(req, "query");
  const since = days != null ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;

  const rows = await prisma.$queryRaw<SurfaceRow[]>`
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

  const bySurface = rows.map((r) => ({
    surface: r.surface,
    ...shape(toNum(r.served), toNum(r.clicked), toNum(r.saved), toNum(r.watched), toNum(r.disliked)),
  }));

  const totals = rows.reduce(
    (acc, r) => {
      acc.served += toNum(r.served);
      acc.clicked += toNum(r.clicked);
      acc.saved += toNum(r.saved);
      acc.watched += toNum(r.watched);
      acc.disliked += toNum(r.disliked);
      return acc;
    },
    { served: 0, clicked: 0, saved: 0, watched: 0, disliked: 0 },
  );

  res.json({
    window: { days: days ?? null, since: since?.toISOString() ?? null },
    overall: shape(totals.served, totals.clicked, totals.saved, totals.watched, totals.disliked),
    bySurface,
  });
});

type RollRow = {
  variant: string;
  rolled: bigint;
  clicked: bigint;
  saved: bigint;
  watched: bigint;
};

// GET /api/metrics/rolls?days=30
//
// Personalized-roll vs random-roll engagement. A roll impression is one
// (actor, film, variant) where variant is "personalized" (roll_personalized)
// or "random" (roll), deduped to the earliest roll. Engagement is attributed
// post-roll: the same actor acting on the same film at or after it was rolled.
// Click-through uses film_click; watch and save use watched / watchlist_add.
metricsRouter.get("/rolls", validate(querySchema, "query"), async (req, res) => {
  const { days } = getValidated<z.infer<typeof querySchema>>(req, "query");
  const since = days != null ? new Date(Date.now() - days * 24 * 60 * 60 * 1000) : null;

  const rows = await prisma.$queryRaw<RollRow[]>`
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

  const byVariant = Object.fromEntries(
    rows.map((r) => {
      const rolled = toNum(r.rolled);
      const clicked = toNum(r.clicked);
      const saved = toNum(r.saved);
      const watched = toNum(r.watched);
      return [
        r.variant,
        {
          rolled,
          clicked,
          saved,
          watched,
          clickThroughRate: rate(clicked, rolled),
          saveRate: rate(saved, rolled),
          watchedRate: rate(watched, rolled),
        },
      ];
    }),
  );

  res.json({
    window: { days: days ?? null, since: since?.toISOString() ?? null },
    personalized: byVariant["personalized"] ?? null,
    random: byVariant["random"] ?? null,
  });
});
