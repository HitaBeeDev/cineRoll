import { rate, toNumber } from "./math";
import { RecommendationMetricCounts, SurfaceRow } from "./types";
import { MetricsWindow, serializeWindow } from "./window";

export function recommendationMetricsPayload(rows: SurfaceRow[], window: MetricsWindow) {
  // Rows are grouped by (surface, variant). Roll them up along each dimension
  // independently: bySurface collapses variants, byVariant collapses surfaces.
  // byVariant is the online A/B proxy — it lets control vs treatment be compared
  // on real CTR / save / watch rates as a sanity check against the offline eval.
  const bySurface = groupBy(rows, row => row.surface).map(([surface, counts]) => ({
    surface,
    ...recommendationShape(counts),
  }));
  const byVariant = groupBy(rows, row => row.variant).map(([variant, counts]) => ({
    variant,
    ...recommendationShape(counts),
  }));
  const totals = rows.reduce((acc, row) => addCounts(acc, rowCounts(row)), emptyCounts());

  return {
    window: serializeWindow(window),
    overall: recommendationShape(totals),
    bySurface,
    byVariant,
  };
}

function emptyCounts(): RecommendationMetricCounts {
  return { served: 0, clicked: 0, saved: 0, watched: 0, disliked: 0 };
}

// Sum counts per key, returning entries ordered by served descending.
function groupBy(
  rows: SurfaceRow[],
  keyOf: (row: SurfaceRow) => string,
): [string, RecommendationMetricCounts][] {
  const totals = new Map<string, RecommendationMetricCounts>();
  for (const row of rows) {
    const key = keyOf(row);
    totals.set(key, addCounts(totals.get(key) ?? emptyCounts(), rowCounts(row)));
  }
  return [...totals.entries()].sort((a, b) => b[1].served - a[1].served);
}

function rowCounts(row: SurfaceRow): RecommendationMetricCounts {
  return {
    served: toNumber(row.served),
    clicked: toNumber(row.clicked),
    saved: toNumber(row.saved),
    watched: toNumber(row.watched),
    disliked: toNumber(row.disliked),
  };
}

function addCounts(
  left: RecommendationMetricCounts,
  right: RecommendationMetricCounts,
): RecommendationMetricCounts {
  return {
    served: left.served + right.served,
    clicked: left.clicked + right.clicked,
    saved: left.saved + right.saved,
    watched: left.watched + right.watched,
    disliked: left.disliked + right.disliked,
  };
}

function recommendationShape(counts: RecommendationMetricCounts) {
  return {
    ...counts,
    ctr: rate(counts.clicked, counts.served),
    saveRate: rate(counts.saved, counts.served),
    watchedRate: rate(counts.watched, counts.served),
    dislikeRate: rate(counts.disliked, counts.served),
  };
}
