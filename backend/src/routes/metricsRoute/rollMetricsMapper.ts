import { rate, toNumber } from "./math";
import { RollMetricCounts, RollRow } from "./types";
import { MetricsWindow, serializeWindow } from "./window";

export function rollMetricsPayload(rows: RollRow[], window: MetricsWindow) {
  const byVariant = Object.fromEntries(
    rows.map(row => [row.variant, rollShape(rowCounts(row))]),
  );

  return {
    window: serializeWindow(window),
    personalized: byVariant["personalized"] ?? null,
    random: byVariant["random"] ?? null,
  };
}

function rowCounts(row: RollRow): RollMetricCounts {
  return {
    rolled: toNumber(row.rolled),
    clicked: toNumber(row.clicked),
    saved: toNumber(row.saved),
    watched: toNumber(row.watched),
  };
}

function rollShape(counts: RollMetricCounts) {
  return {
    ...counts,
    clickThroughRate: rate(counts.clicked, counts.rolled),
    saveRate: rate(counts.saved, counts.rolled),
    watchedRate: rate(counts.watched, counts.rolled),
  };
}
