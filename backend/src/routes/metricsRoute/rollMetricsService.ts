import { getRollMetricRows } from "./rollMetricsRepository";
import { rollMetricsPayload } from "./rollMetricsMapper";
import { metricsWindow } from "./window";

export async function getRollMetrics(days: number | undefined) {
  const window = metricsWindow(days);
  const rows = await getRollMetricRows(window.since);

  return rollMetricsPayload(rows, window);
}
