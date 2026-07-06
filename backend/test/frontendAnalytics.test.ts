import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

async function loadAnalytics() {
  vi.resetModules();
  return import("../../frontend/src/lib/analytics");
}

beforeEach(() => {
  vi.useFakeTimers();

  vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response(null, { status: 202 }))));
  vi.stubGlobal("crypto", {
    randomUUID: vi.fn()
      .mockReturnValueOnce("anon-id")
      .mockReturnValueOnce("session-id"),
  });

  vi.stubGlobal("document", {
    addEventListener: vi.fn(),
    visibilityState: "visible",
  });
  vi.stubGlobal("navigator", {
    sendBeacon: vi.fn(() => true),
  });
  vi.stubGlobal("window", {
    addEventListener: vi.fn(),
    localStorage: storage({ cineroll_cookie_consent: "granted" }),
    sessionStorage: storage(),
    setTimeout: globalThis.setTimeout,
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("frontend analytics event logger", () => {
  it("sends queued events in 25-event batches and flushes the remainder", async () => {
    const { flushEvents, trackEvent } = await loadAnalytics();

    for (let i = 0; i < 26; i += 1) {
      trackEvent({
        type: "film_click",
        filmId: `film-${i}`,
        context: { position: i },
      });
    }

    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(JSON.parse((fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body)).toHaveLength(25);

    await flushEvents();

    expect(fetch).toHaveBeenCalledTimes(2);
    const finalBody = JSON.parse((fetch as ReturnType<typeof vi.fn>).mock.calls[1][1].body);
    expect(finalBody).toMatchObject([
      {
        anonId: "anon-id",
        sessionId: "session-id",
        type: "film_click",
        filmId: "film-25",
        context: { position: 25 },
        consent: "granted",
      },
    ]);
  });

  it("flushes on the scheduled timer and uses sendBeacon for lifecycle flushes", async () => {
    const { flushEvents, trackEvent } = await loadAnalytics();

    trackEvent({ type: "search", context: { query: "noir" } });

    expect(fetch).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(5_000);

    expect(fetch).toHaveBeenCalledTimes(1);

    trackEvent({ type: "pick_of_day_click", filmId: "film-1" });
    await flushEvents(true);

    expect(navigator.sendBeacon).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, payload] = (navigator.sendBeacon as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("/api/events");
    expect(payload).toBeInstanceOf(Blob);
  });
});
