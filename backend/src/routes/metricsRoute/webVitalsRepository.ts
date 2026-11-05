import { prisma } from "../../lib/prisma";

export type WebVitalRow = {
  metric: string;
  page: string;
  samples: bigint;
  p75: number;
  good: bigint;
  poor: bigint;
};

/**
 * p75 per metric per page type — the percentile Google's Core Web Vitals
 * assessment uses — plus how many samples rated good and poor. One row per
 * page load per metric: the client sends each metric's final value once.
 */
export function getWebVitalRows(since: Date | null): Promise<WebVitalRow[]> {
  return prisma.$queryRaw<WebVitalRow[]>`
    SELECT
      e.context->>'metric' AS metric,
      e.context->>'page' AS page,
      COUNT(*)::bigint AS samples,
      percentile_cont(0.75) WITHIN GROUP (ORDER BY (e.context->>'value')::float8) AS p75,
      COUNT(*) FILTER (WHERE e.context->>'rating' = 'good')::bigint AS good,
      COUNT(*) FILTER (WHERE e.context->>'rating' = 'poor')::bigint AS poor
    FROM "Event" e
    WHERE e.type = 'web_vital'
      AND e.context ? 'metric' AND e.context ? 'value'
      AND (${since}::timestamptz IS NULL OR e."createdAt" >= ${since})
    GROUP BY metric, page
    ORDER BY metric, samples DESC
  `;
}

export type InpInteractionRow = {
  page: string;
  interaction: string;
  samples: bigint;
  p75: number;
  poor: bigint;
};

/**
 * INP split by the control that caused it (the `data-vital` tag reported with
 * each sample), so a slow roll button and a slow filter don't blur into one
 * page-wide number.
 */
export function getInpInteractionRows(since: Date | null): Promise<InpInteractionRow[]> {
  return prisma.$queryRaw<InpInteractionRow[]>`
    SELECT
      e.context->>'page' AS page,
      COALESCE(e.context->>'interaction', 'untagged') AS interaction,
      COUNT(*)::bigint AS samples,
      percentile_cont(0.75) WITHIN GROUP (ORDER BY (e.context->>'value')::float8) AS p75,
      COUNT(*) FILTER (WHERE e.context->>'rating' = 'poor')::bigint AS poor
    FROM "Event" e
    WHERE e.type = 'web_vital'
      AND e.context->>'metric' = 'INP'
      AND e.context ? 'value'
      AND (${since}::timestamptz IS NULL OR e."createdAt" >= ${since})
    GROUP BY page, interaction
    ORDER BY p75 DESC
  `;
}
