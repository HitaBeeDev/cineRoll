import { beforeEach, describe, expect, it, vi } from "vitest";

import { pageType } from "../../frontend/src/lib/analytics/web-vitals/page-type";

const rows = vi.hoisted(() => ({ value: [] as unknown[] }));
vi.mock("../src/routes/metricsRoute/webVitalsRepository", () => ({
  getWebVitalRows: vi.fn(async () => rows.value),
}));

import { getWebVitalsMetrics } from "../src/routes/metricsRoute/webVitalsService";

describe("pageType", () => {
  it("groups URLs by the template they render", () => {
    expect(pageType("/")).toBe("/");
    expect(pageType("/browse")).toBe("/browse");
    expect(pageType("/film/parasite-2019")).toBe("/film/[…]");
    expect(pageType("/awards/oscars/best-picture/1994")).toBe("/awards/[…]");
  });
});

describe("getWebVitalsMetrics", () => {
  beforeEach(() => {
    rows.value = [];
  });

  it("judges each p75 against Google's good ceiling", async () => {
    rows.value = [
      { metric: "LCP", page: "/film/[…]", samples: 10n, p75: 2400.4, good: 8n, poor: 1n },
      { metric: "INP", page: "/browse", samples: 4n, p75: 260, good: 1n, poor: 2n },
      { metric: "CLS", page: "/", samples: 5n, p75: 0.12345, good: 3n, poor: 0n },
    ];
    const { pages, window } = await getWebVitalsMetrics(undefined);

    expect(window.days).toBe(28);
    expect(pages).toEqual([
      { metric: "LCP", page: "/film/[…]", samples: 10, p75: 2400, passes: true, goodShare: 0.8, poorShare: 0.1 },
      { metric: "INP", page: "/browse", samples: 4, p75: 260, passes: false, goodShare: 0.25, poorShare: 0.5 },
      { metric: "CLS", page: "/", samples: 5, p75: 0.123, passes: false, goodShare: 0.6, poorShare: 0 },
    ]);
  });
});
