import { getRecommendationMetricRows } from "./recommendationMetricsRepository";
import { recommendationMetricsPayload } from "./recommendationMetricsMapper";
import { metricsWindow } from "./window";

export async function getRecommendationMetrics(days: number | undefined) {
  const window = metricsWindow(days);
  const rows = await getRecommendationMetricRows(window.since);

  return recommendationMetricsPayload(rows, window);
}
