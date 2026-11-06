import { describe, expect, it } from "vitest";

import { planSeed, type ExistingFilmRow, type SeedRecord } from "../data/lib/seedPlan";

const rec = (slug: string, tmdbId: number | null, over: Partial<SeedRecord> = {}): SeedRecord => ({
  slug, tmdbId, contentType: "movie", imdbId: null, ...over,
});
const row = (id: string, slug: string, tmdbId: number | null, over: Partial<ExistingFilmRow> = {}): ExistingFilmRow => ({
  id, slug, tmdbId, contentType: "movie", imdbId: null, ...over,
});

describe("planSeed", () => {
  it("keeps every existing row's id when nothing changed", () => {
    const plan = planSeed([rec("a-2000", 1), rec("b-2001", 2)], [row("A", "a-2000", 1), row("B", "b-2001", 2)]);
    expect(plan.matchIds).toEqual(["A", "B"]);
    expect(plan.gone).toEqual([]);
    expect(plan.renamed).toEqual([]);
  });

  it("keeps the row when only the slug changed (retitle)", () => {
    const plan = planSeed(
      [rec("curvas-peligrosas-dangerous-curves-1950", 675171)],
      [row("X", "dangerous-curves-dangerous-curves-uk-1950", 675171)],
    );
    expect(plan.matchIds).toEqual(["X"]);
    expect(plan.renamed).toEqual([{ id: "X", from: "dangerous-curves-dangerous-curves-uk-1950", to: "curvas-peligrosas-dangerous-curves-1950" }]);
  });

  it("keeps the row by slug when its tmdbId was corrected", () => {
    const plan = planSeed([rec("snow-2006", 409838)], [row("S", "snow-2006", 999)]);
    expect(plan.matchIds).toEqual(["S"]);
    expect(plan.gone).toEqual([]);
  });

  it("does not hand a row to a slug match when its TMDB identity belongs to another record", () => {
    // Row R is tmdb 5 at slug "x". Master moved tmdb 5 to slug "y" and put a new film at "x".
    const plan = planSeed([rec("x", 6), rec("y", 5)], [row("R", "x", 5)]);
    expect(plan.matchIds).toEqual([null, "R"]);
  });

  it("scopes TMDB identity by content type", () => {
    const plan = planSeed(
      [rec("ed-film", 7, { contentType: "movie" }), rec("ed-series", 7, { contentType: "tv" })],
      [row("M", "ed-film", 7, { contentType: "movie" }), row("T", "ed-series", 7, { contentType: "tv" })],
    );
    expect(plan.matchIds).toEqual(["M", "T"]);
  });

  it("creates new films and lists removed ones", () => {
    const plan = planSeed([rec("a", 1), rec("new", 3)], [row("A", "a", 1), row("OLD", "old", 2)]);
    expect(plan.matchIds).toEqual(["A", null]);
    expect(plan.gone.map((r) => r.id)).toEqual(["OLD"]);
  });

  it("matches films with no tmdbId by slug", () => {
    const plan = planSeed([rec("doc-1950", null)], [row("D", "doc-1950", null)]);
    expect(plan.matchIds).toEqual(["D"]);
  });

  it("flags an imdbId change so it can be cleared before the swap", () => {
    const plan = planSeed([rec("a", 1, { imdbId: "tt2" })], [row("A", "a", 1, { imdbId: "tt1" })]);
    expect(plan.imdbChanged).toEqual(["A"]);
  });

  it("refuses a master file that breaks the table's unique rules", () => {
    const plan = planSeed(
      [rec("a", 1, { imdbId: "tt1" }), rec("a", 2), rec("c", 1), rec("d", 4, { imdbId: "tt1" }), rec("", 9)],
      [row("A", "a", 1)],
    );
    expect(plan.problems).toEqual([
      "record 4 has no slug",
      'duplicate slug "a" (records 0 and 1)',
      'duplicate tmdbId "movie:1" (records 0 and 2)',
      'duplicate imdbId "tt1" (records 0 and 3)',
    ]);
    expect(plan.matchIds.every((id) => id === null)).toBe(true);
  });
});
