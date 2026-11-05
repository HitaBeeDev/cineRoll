import { getInpInteractionRows, getWebVitalRows } from "./webVitalsRepository";
import { metricsWindow, serializeWindow } from "./window";

// Google's "good" ceilings at p75: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1.
const GOOD_P75: Record<string, number> = { LCP: 2500, INP: 200, CLS: 0.1 };

// The interactions the roadmap says to watch (SEO plan, Step 10). Both run real
// work on click — a roll request + animation, a filter recount + grid refetch —
// so they are the likeliest to cross 200 ms. Each is a page type + tag(s).
const WATCHED = [
  { key: "home-roll", page: "/", interactions: ["home-roll"] },
  { key: "browse-filters", page: "/browse", interactions: ["browse-filters", "filter-option"] },
] as const;

/** Field Core Web Vitals per page type, judged the way Search Console judges them. */
export async function getWebVitalsMetrics(days: number | undefined) {
  const window = metricsWindow(days ?? 28);
  const [rows, inpRows] = await Promise.all([getWebVitalRows(window.since), getInpInteractionRows(window.since)]);
  const inpByInteraction = inpRows.map(row => ({
    page: row.page,
    interaction: row.interaction,
    samples: Number(row.samples),
    p75: Math.round(row.p75),
    passes: row.p75 <= GOOD_P75.INP!,
    poorShare: Number(row.samples) > 0 ? Number(row.poor) / Number(row.samples) : 0,
  }));

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
    inpByInteraction,
    // The two named watches, answered directly: the worst p75 among their
    // tags (one slow tag is enough to fail), or null before any sample exists.
    watched: WATCHED.map(watch => {
      const matching = inpByInteraction.filter(
        row => row.page === watch.page && (watch.interactions as readonly string[]).includes(row.interaction),
      );
      if (matching.length === 0) return { key: watch.key, samples: 0, p75: null, passes: null };
      const worst = matching.reduce((a, b) => (b.p75 > a.p75 ? b : a));
      return {
        key: watch.key,
        samples: matching.reduce((sum, row) => sum + row.samples, 0),
        p75: worst.p75,
        passes: worst.passes,
      };
    }),
  };
}
