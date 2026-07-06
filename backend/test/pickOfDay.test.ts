import { beforeEach, describe, expect, it, vi } from "vitest";

import { PICK_OF_DAY_CONFIG } from "../src/lib/pickOfDay/constants";
import { calendarDay, dateKey, daysBefore } from "../src/lib/pickOfDay/date";
import { selectFromPool } from "../src/lib/pickOfDay/scorer";
import { seededUnit } from "../src/lib/pickOfDay/seed";
import type { PickRow, PoolRow } from "../src/lib/pickOfDay/types";

// The service talks to Postgres through ./repository; mock that boundary so the
// orchestration (override short-circuit, no-repeat exclusion, fallback) can be
// unit-tested with no DB — the real repository is covered by integration tests.
vi.mock("../src/lib/pickOfDay/repository", () => ({
  fetchPick: vi.fn(),
  findPickHistory: vi.fn(),
  deletePickHistory: vi.fn(),
  findRecentPickFilmIds: vi.fn(),
  createPickHistory: vi.fn(),
  loadPool: vi.fn(),
}));

import * as repo from "../src/lib/pickOfDay/repository";
import { getPickOfDay } from "../src/lib/pickOfDay/service";

// ── fixtures ──────────────────────────────────────────────────────────────────
function poolRow(id: string, over: Partial<PoolRow> = {}): PoolRow {
  return {
    id,
    slug: id,
    title: id,
    originalTitle: null,
    releaseYear: 2000,
    runtime: 120,
    genres: [],
    contentType: "movie",
    plot: null,
    director: null,
    posterUrl: `poster/${id}`,
    posterColor: null,
    backdropUrl: null,
    imdbRating: 8,
    rtScore: 90,
    oscarNominations: 0,
    oscarWins: 0,
    ggNominations: 0,
    ggWins: 0,
    cannesNominations: 0,
    cannesWins: 0,
    prestige: 10,
    rollCount: 0,
    ...over,
  };
}

function pickRow(id: string): PickRow {
  const { prestige: _p, rollCount: _r, ...rest } = poolRow(id);
  return rest;
}

// A near-uniform pool: equal prestige and zero rolls, so the per-date seed is the
// only tie-breaker — i.e. the pick is driven purely by the date.
const uniformPool: PoolRow[] = Array.from({ length: 12 }, (_, i) =>
  poolRow(`F${i}`, { prestige: 10, rollCount: 0 }),
);

// ── pure: seededUnit ────────────────────────────────────────────────────────────
describe("seededUnit", () => {
  it("is deterministic for the same key", () => {
    expect(seededUnit("2025-06-15:F1")).toBe(seededUnit("2025-06-15:F1"));
  });

  it("returns a value in [0, 1)", () => {
    for (const key of ["a", "2025-06-15:F1", "", "zzz"]) {
      const v = seededUnit(key);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("varies with the key (date and film both matter)", () => {
    expect(seededUnit("2025-06-15:F1")).not.toBe(seededUnit("2025-06-16:F1"));
    expect(seededUnit("2025-06-15:F1")).not.toBe(seededUnit("2025-06-15:F2"));
  });
});

// ── pure: deterministic per date ────────────────────────────────────────────────
describe("selectFromPool — deterministic per date", () => {
  it("returns null for an empty pool", () => {
    expect(selectFromPool([], "2025-06-15")).toBeNull();
  });

  it("returns the same film for the same pool + date", () => {
    const a = selectFromPool(uniformPool, "2025-06-15");
    const b = selectFromPool(uniformPool, "2025-06-15");
    expect(a).toBe(b);
    expect(a).not.toBeNull();
  });

  it("is independent of pool ordering (stable tie-break)", () => {
    const forward = selectFromPool(uniformPool, "2025-06-15");
    const reversed = selectFromPool([...uniformPool].reverse(), "2025-06-15");
    expect(reversed).toBe(forward);
  });

  it("depends on the date — different days rotate the pick", () => {
    const winners = new Set(
      Array.from({ length: 30 }, (_, i) =>
        selectFromPool(uniformPool, `2025-06-${String(i + 1).padStart(2, "0")}`),
      ),
    );
    // Over a month the date-seed must surface more than one film (no fixed pick).
    expect(winners.size).toBeGreaterThan(1);
  });

  it("prefers higher prestige when the date-seed is held constant", () => {
    // One film far above the rest: quality dominates the small seed term.
    const pool = [
      poolRow("LOW1", { prestige: 1 }),
      poolRow("LOW2", { prestige: 1 }),
      poolRow("STAR", { prestige: 100 }),
    ];
    expect(selectFromPool(pool, "2025-06-15")).toBe("STAR");
  });
});

// ── pure: calendar day collapses time-of-day ────────────────────────────────────
describe("calendarDay / dateKey — one pick per calendar day", () => {
  it("maps every time on a UTC day to the same date key", () => {
    const morning = new Date("2025-06-15T06:30:00.000Z");
    const evening = new Date("2025-06-15T23:59:59.000Z");
    expect(dateKey(calendarDay(morning))).toBe("2025-06-15");
    expect(dateKey(calendarDay(morning))).toBe(dateKey(calendarDay(evening)));
  });
});

// ── service: override, no-repeat, fallback, determinism ─────────────────────────
describe("getPickOfDay — service orchestration", () => {
  const DATE = new Date("2025-06-15T12:00:00.000Z");
  const DAY = calendarDay(DATE);

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(repo.findPickHistory).mockResolvedValue(null);
    vi.mocked(repo.findRecentPickFilmIds).mockResolvedValue([]);
    vi.mocked(repo.loadPool).mockResolvedValue(uniformPool);
    vi.mocked(repo.createPickHistory).mockResolvedValue(undefined);
    vi.mocked(repo.fetchPick).mockResolvedValue(null);
    vi.mocked(repo.deletePickHistory).mockResolvedValue(undefined);
  });

  it("respects an override — a history row for the day wins, skipping selection", async () => {
    vi.mocked(repo.findPickHistory).mockResolvedValue({
      date: DAY,
      filmId: "OVERRIDE",
    } as never);
    vi.mocked(repo.fetchPick).mockResolvedValue(pickRow("OVERRIDE"));

    const result = await getPickOfDay(DATE);

    expect(result).toEqual({ film: pickRow("OVERRIDE"), fromHistory: true });
    // Selection path must be skipped entirely when an override exists.
    expect(repo.findRecentPickFilmIds).not.toHaveBeenCalled();
    expect(repo.loadPool).not.toHaveBeenCalled();
    expect(repo.createPickHistory).not.toHaveBeenCalled();
  });

  it("no-repeat: excludes films picked within the window from the pool", async () => {
    vi.mocked(repo.findRecentPickFilmIds).mockResolvedValue(["R1", "R2"]);
    // The repository (real SQL) would omit R1/R2; the mock returns a clean pool.
    vi.mocked(repo.loadPool).mockResolvedValue([poolRow("P1"), poolRow("P2")]);

    const result = await getPickOfDay(DATE);

    // Recent window is [day - noRepeatDays, day].
    expect(repo.findRecentPickFilmIds).toHaveBeenCalledWith(
      daysBefore(DAY, PICK_OF_DAY_CONFIG.noRepeatDays),
    );
    // The recent ids are handed to the pool query as the exclusion set.
    expect(repo.loadPool).toHaveBeenCalledWith(["R1", "R2"]);
    // And the pick is never one of the recently-used films.
    expect(["R1", "R2"]).not.toContain(result?.film.id);
    expect(result?.fromHistory).toBe(false);
  });

  it("falls back to the full catalog when the no-repeat filter empties the pool", async () => {
    vi.mocked(repo.findRecentPickFilmIds).mockResolvedValue(["R1", "R2"]);
    vi.mocked(repo.loadPool)
      .mockResolvedValueOnce([]) // exclusion wipes out the pool
      .mockResolvedValueOnce([poolRow("ONLY")]); // reload with no exclusions

    const result = await getPickOfDay(DATE);

    expect(repo.loadPool).toHaveBeenNthCalledWith(1, ["R1", "R2"]);
    expect(repo.loadPool).toHaveBeenNthCalledWith(2, []);
    expect(result?.film.id).toBe("ONLY");
  });

  it("returns null when the catalog is empty even without exclusions", async () => {
    vi.mocked(repo.loadPool).mockResolvedValue([]);
    expect(await getPickOfDay(DATE)).toBeNull();
  });

  it("is deterministic across a day — records the chosen film once, then serves it", async () => {
    const first = await getPickOfDay(DATE);
    expect(first?.fromHistory).toBe(false);
    expect(repo.createPickHistory).toHaveBeenCalledWith(first?.film.id, DAY);

    // A later request the same day now finds the persisted row and returns it,
    // so the pick is stable regardless of when it is requested.
    vi.mocked(repo.findPickHistory).mockResolvedValue({
      date: DAY,
      filmId: first!.film.id,
    } as never);
    vi.mocked(repo.fetchPick).mockResolvedValue(pickRow(first!.film.id));

    const second = await getPickOfDay(new Date("2025-06-15T21:45:00.000Z"));
    expect(second?.film.id).toBe(first?.film.id);
    expect(second?.fromHistory).toBe(true);
  });

  it("resolves a concurrent write race to the winner's pick (P2002)", async () => {
    const { Prisma } = await import("@prisma/client");
    const conflict = new Prisma.PrismaClientKnownRequestError("dup", {
      code: "P2002",
      clientVersion: "test",
    });
    vi.mocked(repo.createPickHistory).mockRejectedValue(conflict);
    // After the unique-constraint clash, the row written by the other request is read back.
    vi.mocked(repo.findPickHistory)
      .mockResolvedValueOnce(null) // our initial lookup: nothing yet
      .mockResolvedValueOnce({ date: DAY, filmId: "WINNER" } as never); // post-clash re-read
    vi.mocked(repo.fetchPick).mockResolvedValue(pickRow("WINNER"));

    const result = await getPickOfDay(DATE);

    expect(result).toEqual({ film: pickRow("WINNER"), fromHistory: true });
  });
});
