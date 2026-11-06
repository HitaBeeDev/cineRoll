import type { WatchProviders } from "@cineroll/types";
import { describe, expect, it } from "vitest";

import type { WatchFetchResult } from "../src/lib/watchRefresh/fetchWatchRegions";
import { type DueFilm, type RefreshDeps, refreshWatchProviders } from "../src/lib/watchRefresh/refreshWatchProviders";
import { adTierBase } from "../src/lib/watchRefresh/adTierBase";
import { sameServices } from "../src/lib/watchRefresh/sameServices";
import { tmdbWatchRegions } from "../src/lib/watchRefresh/tmdbWatchRegions";

const mubi = { id: 11, name: "MUBI", logoPath: "/mubi.jpg" };
const netflix = { id: 8, name: "Netflix", logoPath: "/nf.jpg" };

describe("tmdbWatchRegions", () => {
  it("keeps subscription services only, in TMDB's order, countries sorted", () => {
    expect(
      tmdbWatchRegions({
        results: {
          US: {
            flatrate: [
              { provider_id: 8, provider_name: "Netflix", logo_path: "/nf.jpg", display_priority: 2 },
              { provider_id: 11, provider_name: "MUBI", logo_path: "/mubi.jpg", display_priority: 1 },
              { provider_id: 11, provider_name: "MUBI", logo_path: "/mubi.jpg", display_priority: 1 },
            ],
          },
          DE: { flatrate: [{ provider_id: 11, provider_name: "MUBI", logo_path: "/mubi.jpg" }] },
          FR: {},
          xx: { flatrate: [{ provider_id: 1, provider_name: "Bad", logo_path: null }] },
        },
      }),
    ).toEqual([
      { country: "DE", providers: [mubi] },
      { country: "US", providers: [mubi, netflix] },
    ]);
  });

  it("is empty when TMDB has nothing", () => {
    expect(tmdbWatchRegions({})).toEqual([]);
  });

  it("folds an ad tier into its main service, keeps it when it is the only way", () => {
    expect(
      tmdbWatchRegions({
        results: {
          US: {
            flatrate: [
              { provider_id: 9, provider_name: "Amazon Prime Video", logo_path: null },
              { provider_id: 2100, provider_name: "Amazon Prime Video with Ads", logo_path: null },
              { provider_id: 8, provider_name: "Netflix", logo_path: "/nf.jpg" },
              { provider_id: 1796, provider_name: "Netflix Standard with Ads", logo_path: null },
            ],
          },
          JP: { flatrate: [{ provider_id: 2100, provider_name: "Amazon Prime Video with Ads", logo_path: null }] },
        },
      }),
    ).toEqual([
      { country: "JP", providers: [{ id: 2100, name: "Amazon Prime Video with Ads", logoPath: null }] },
      { country: "US", providers: [{ id: 9, name: "Amazon Prime Video", logoPath: null }, netflix] },
    ]);
  });
});

describe("adTierBase", () => {
  it("names the main service of an ad tier", () => {
    expect(adTierBase("Amazon Prime Video with Ads")).toBe("Amazon Prime Video");
    expect(adTierBase("Netflix Standard with Ads")).toBe("Netflix");
    expect(adTierBase("Paramount Plus Basic with Ads")).toBe("Paramount Plus");
    expect(adTierBase("Netflix")).toBeNull();
    expect(adTierBase("with Ads")).toBeNull();
  });
});

describe("sameServices", () => {
  it("ignores ids, logos and order", () => {
    const seeded = [{ country: "US", providers: [{ id: null, name: "Netflix", logoPath: null }, { id: null, name: "MUBI", logoPath: null }] }];
    expect(sameServices(seeded, [{ country: "US", providers: [mubi, netflix] }])).toBe(true);
  });

  it("sees a service or a country come and go", () => {
    expect(sameServices([{ country: "US", providers: [mubi] }], [{ country: "US", providers: [netflix] }])).toBe(false);
    expect(sameServices([{ country: "US", providers: [mubi] }], [])).toBe(false);
  });
});

describe("refreshWatchProviders", () => {
  const film = (id: string, watchProviders: WatchProviders | null = null): DueFilm => ({
    id,
    tmdbId: Number(id.slice(1)),
    contentType: "movie",
    watchProviders,
  });

  function setup(films: DueFilm[], answers: Record<number, WatchFetchResult>, clock = { t: 0, step: 0 }) {
    const saved: { id: string; value: WatchProviders; changed: boolean }[] = [];
    let asked = 0;
    const deps: RefreshDeps = {
      countRefreshable: async () => films.length * 7,
      findDue: async (limit) => films.slice(0, limit),
      fetchRegions: async (tmdbId) => {
        asked++;
        clock.t += clock.step;
        return answers[tmdbId] ?? { status: "ok", regions: [] };
      },
      save: async (id, value, changed) => {
        saved.push({ id, value, changed });
      },
      now: () => new Date(clock.t),
    };
    return { deps, saved, asked: () => asked };
  }

  const options = { cycleRuns: 7, budgetMs: 1000, concurrency: 1 };

  it("asks for a seventh of the catalogue and saves each answer", async () => {
    const { deps, saved } = setup([film("f1"), film("f2")], { 1: { status: "ok", regions: [{ country: "US", providers: [mubi] }] } });
    const report = await refreshWatchProviders(deps, options);

    expect(report).toMatchObject({ due: 2, checked: 2, changed: 1, failed: 0 });
    expect(saved[0]).toMatchObject({ id: "f1", changed: true, value: { regions: [{ country: "US" }] } });
    // Checked and streaming nowhere: stored as [], so it rotates to the back.
    expect(saved[1]).toMatchObject({ id: "f2", changed: false, value: { regions: [] } });
  });

  it("stores not-found as streaming nowhere, leaves errors for the next run", async () => {
    const before = { asOf: "2026-01-01T00:00:00.000Z", regions: [{ country: "US", providers: [mubi] }] };
    const { deps, saved } = setup([film("f1", before), film("f2", before)], {
      1: { status: "not-found" },
      2: { status: "error" },
    });
    const report = await refreshWatchProviders(deps, options);

    expect(report).toMatchObject({ checked: 1, changed: 1, failed: 1 });
    expect(saved.map((row) => row.id)).toEqual(["f1"]);
  });

  it("stops at a rate limit", async () => {
    const { deps, saved, asked } = setup([film("f1"), film("f2"), film("f3")], { 2: { status: "rate-limited" } });
    const report = await refreshWatchProviders(deps, options);

    expect(report.rateLimited).toBe(true);
    expect(asked()).toBe(2);
    expect(saved.map((row) => row.id)).toEqual(["f1"]);
  });

  it("stops starting fetches once the time budget is spent", async () => {
    const { deps, asked } = setup([film("f1"), film("f2"), film("f3")], {}, { t: 0, step: 600 });
    const report = await refreshWatchProviders(deps, options);

    expect(report.outOfTime).toBe(true);
    expect(asked()).toBe(2);
  });
});
