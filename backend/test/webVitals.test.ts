import { beforeEach, describe, expect, it, vi } from "vitest";

import { pageType } from "../../frontend/src/lib/analytics/web-vitals/page-type";

const rows = vi.hoisted(() => ({ value: [] as unknown[], inp: [] as unknown[] }));
vi.mock("../src/routes/metricsRoute/webVitalsRepository", () => ({
  getWebVitalRows: vi.fn(async () => rows.value),
  getInpInteractionRows: vi.fn(async () => rows.inp),
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
    rows.inp = [];
  });

  it("answers the two watches, failing on the worst tag", async () => {
    rows.inp = [
      { page: "/browse", interaction: "filter-option", samples: 6n, p75: 310, poor: 2n },
      { page: "/browse", interaction: "browse-filters", samples: 4n, p75: 150, poor: 0n },
      { page: "/", interaction: "home-roll", samples: 9n, p75: 120.6, poor: 0n },
      { page: "/film/[…]", interaction: "untagged", samples: 3n, p75: 90, poor: 0n },
    ];
    const { watched, inpByInteraction } = await getWebVitalsMetrics(7);

    expect(inpByInteraction).toHaveLength(4);
    expect(watched).toEqual([
      { key: "home-roll", samples: 9, p75: 121, passes: true },
      { key: "browse-filters", samples: 10, p75: 310, passes: false },
    ]);
  });

  it("reports no verdict before any sample", async () => {
    const { watched } = await getWebVitalsMetrics(7);
    expect(watched).toEqual([
      { key: "home-roll", samples: 0, p75: null, passes: null },
      { key: "browse-filters", samples: 0, p75: null, passes: null },
    ]);
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
