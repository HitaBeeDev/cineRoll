import { rate, toNumber } from "./math";
import { RecommendationMetricCounts, SurfaceRow } from "./types";
import { MetricsWindow, serializeWindow } from "./window";

export function recommendationMetricsPayload(rows: SurfaceRow[], window: MetricsWindow) {
  const bySurface = rows.map(row => ({
    surface: row.surface,
    ...recommendationShape(rowCounts(row)),
  }));
  const totals = rows.reduce(
    (acc, row) => addCounts(acc, rowCounts(row)),
    { served: 0, clicked: 0, saved: 0, watched: 0, disliked: 0 },
  );

  return {
    window: serializeWindow(window),
    overall: recommendationShape(totals),
    bySurface,
  };
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
