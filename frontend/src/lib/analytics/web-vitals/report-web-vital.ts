import { trackEvent } from "@/lib/analytics/track-event";
import { pageType } from "./page-type";

// The three Core Web Vitals Google ranks on; TTFB/FCP are diagnostics, not scored.
const REPORTED = new Set(["LCP", "INP", "CLS"]);

type Metric = {
  id: string;
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  navigationType: string;
};

/**
 * One metric → one `web_vital` event. Next reports each metric's final value
 * once per page load, so a row is a sample. The key is `metric`, not `name`:
 * the backend drops any context key matching /name/i as possible PII.
 * Consent-gated like every other event (inside trackEvent).
 */
export function reportWebVital(metric: Metric): void {
  if (!REPORTED.has(metric.name)) return;
  trackEvent({
    type: "web_vital",
    context: {
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
      navigationType: metric.navigationType,
      page: pageType(window.location.pathname),
      metricId: metric.id,
    },
  });
}
