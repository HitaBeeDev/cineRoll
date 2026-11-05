import { getWebVitalRows } from "./webVitalsRepository";
import { metricsWindow, serializeWindow } from "./window";

// Google's "good" ceilings at p75: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.
const GOOD_P75: Record<string, number> = { LCP: 2500, INP: 200, CLS: 0.1 };

/** Field Core Web Vitals per page type, judged the way Search Console judges them. */
export async function getWebVitalsMetrics(days: number | undefined) {
  const window = metricsWindow(days ?? 28);
  const rows = await getWebVitalRows(window.since);

  return {
    window: serializeWindow(window),
    pages: rows.map(row => {
      const samples = Number(row.samples);
      const limit = GOOD_P75[row.metric];
      return {
        metric: row.metric,
        page: row.page,
        samples,
        p75: row.metric === "CLS" ? Math.round(row.p75 * 1000) / 1000 : Math.round(row.p75),
        passes: limit != null ? row.p75 <= limit : null,
        goodShare: samples > 0 ? Number(row.good) / samples : 0,
        poorShare: samples > 0 ? Number(row.poor) / samples : 0,
      };
    }),
  };
}
