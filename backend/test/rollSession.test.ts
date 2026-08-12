import { afterEach, describe, expect, it, vi } from "vitest";

import { randomQuerySchema } from "../src/lib/filmFilters/randomQuerySchema";

type StoredValues = Record<string, string>;

function storage(initial: StoredValues = {}): Storage {
  const values = new Map(Object.entries(initial));

  return {
    get length() {
      return values.size;
    },
    clear: vi.fn(() => values.clear()),
    getItem: vi.fn((key: string) => values.get(key) ?? null),
    key: vi.fn((index: number) => [...values.keys()][index] ?? null),
    removeItem: vi.fn((key: string) => {
      values.delete(key);
    }),
    setItem: vi.fn((key: string, value: string) => {
      values.set(key, value);
    }),
  };
}

const PENDING_KEY = "cineroll_pending_roll";

function pendingRoll(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    film: { id: "film-1", genres: ["Horror"], contentType: "movie" },
    lane: "gem",
    drawId: "draw-1",
    index: 2,
    engaged: false,
    rejected: false,
    ...overrides,
  });
}

async function loadSession(session: StoredValues = {}) {
  vi.resetModules();
  vi.stubGlobal("window", {
    sessionStorage: storage(session),
    localStorage: storage(),
  });
  return {
    ...(await import("../../frontend/src/features/roll/spend-pending-roll")),
    ...(await import("../../frontend/src/lib/home-storage")),
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("spendPendingRoll", () => {
  it("grades an untouched draw as passed and steps the chain forward", async () => {
    const { spendPendingRoll } = await loadSession({ [PENDING_KEY]: pendingRoll() });

    const spent = spendPendingRoll();

    expect(spent.parentDraw).toEqual({ drawId: "draw-1", outcome: "passed" });
    expect(spent.drawIndex).toBe(3);
    // A pass is a miss for the lane that produced it.
    expect(spent.banditFeedback).toEqual({ lane: "gem", reward: 0 });
  });

  it("grades a draw the user acted on as engaged, and rewards its lane", async () => {
    const { spendPendingRoll } = await loadSession({
      [PENDING_KEY]: pendingRoll({ engaged: true }),
    });

    const spent = spendPendingRoll();

    expect(spent.parentDraw?.outcome).toBe("engaged");
    expect(spent.banditFeedback).toEqual({ lane: "gem", reward: 1 });
  });

  it("counts engagement over rejection when the user did both", async () => {
    const { spendPendingRoll } = await loadSession({
      [PENDING_KEY]: pendingRoll({ engaged: true, rejected: true }),
    });

    expect(spendPendingRoll().parentDraw?.outcome).toBe("engaged");
  });

  it("penalizes a rejected draw's genre harder than one merely passed", async () => {
    const rejected = await loadSession({ [PENDING_KEY]: pendingRoll({ rejected: true }) });
    rejected.spendPendingRoll();
    const strong = rejected.getRerollPenalty().genre["Horror"] ?? 0;

    const passed = await loadSession({ [PENDING_KEY]: pendingRoll() });
    passed.spendPendingRoll();
    const weak = passed.getRerollPenalty().genre["Horror"] ?? 0;

    expect(strong).toBeGreaterThan(weak);
    expect(weak).toBeGreaterThan(0);
  });

  it("leaves an engaged draw's genre unpenalized", async () => {
    const { spendPendingRoll, getRerollPenalty } = await loadSession({
      [PENDING_KEY]: pendingRoll({ engaged: true }),
    });

    spendPendingRoll();

    expect(getRerollPenalty().genre["Horror"]).toBeUndefined();
  });

  it("spends the draw once — a second roll finds nothing left to grade", async () => {
    const { spendPendingRoll } = await loadSession({ [PENDING_KEY]: pendingRoll() });

    spendPendingRoll();

    expect(spendPendingRoll()).toEqual({
      banditFeedback: undefined,
      parentDraw: undefined,
      drawIndex: 0,
    });
  });

  it("starts a fresh chain when a stored draw is malformed", async () => {
    const { spendPendingRoll } = await loadSession({ [PENDING_KEY]: '{"film":{"id":"x"}}' });

    expect(spendPendingRoll().drawIndex).toBe(0);
  });
});

describe("random query chain params", () => {
  it("accepts a parent draw and its position", () => {
    const parsed = randomQuerySchema.parse({
      parentDraw: JSON.stringify({ drawId: "draw-1", outcome: "rejected" }),
      drawIndex: "4",
    });

    expect(parsed.parentDraw).toEqual({ drawId: "draw-1", outcome: "rejected" });
    expect(parsed.drawIndex).toBe(4);
  });

  it("rejects an outcome outside the three the engine records", () => {
    expect(() =>
      randomQuerySchema.parse({
        parentDraw: JSON.stringify({ drawId: "draw-1", outcome: "loved-it" }),
      }),
    ).toThrow();
  });

  it("treats a chainless roll as the start of a session", () => {
    const parsed = randomQuerySchema.parse({});

    expect(parsed.parentDraw).toBeUndefined();
    expect(parsed.drawIndex).toBeUndefined();
  });
});
