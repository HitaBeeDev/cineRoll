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
    dispatchEvent: vi.fn(),
    localStorage: storage({ cineroll_cookie_consent: "granted" }),
    sessionStorage: storage(),
    setTimeout: globalThis.setTimeout,
  });
  vi.stubGlobal(
    "CustomEvent",
    class CustomEvent<T> extends Event {
      detail: T;

      constructor(type: string, eventInitDict?: CustomEventInit<T>) {
        super(type, eventInitDict);
        this.detail = eventInitDict?.detail as T;
      }
    },
  );
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("frontend analytics event logger", () => {
  it("does not create identifiers or queue events before analytics consent", async () => {
    vi.stubGlobal("window", {
      addEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      localStorage: storage(),
      sessionStorage: storage(),
      setTimeout: globalThis.setTimeout,
    });

    const { hasAnalyticsConsent, trackEvent } = await loadAnalytics();

    expect(hasAnalyticsConsent()).toBe(false);

    trackEvent({ type: "search", context: { query: "kurosawa" } });
    await vi.advanceTimersByTimeAsync(5_000);

    expect(fetch).not.toHaveBeenCalled();
    expect(window.localStorage.setItem).not.toHaveBeenCalled();
    expect(window.sessionStorage.setItem).not.toHaveBeenCalled();
  });

  it("stores consent choice and clears analytics identifiers when declined", async () => {
    const { setCookieConsentChoice, getCookieConsentChoice } = await loadAnalytics();

    window.localStorage.setItem("cineroll_anon_id", "anon-id");
    window.sessionStorage.setItem("cineroll_session_id", "session-id");
    window.sessionStorage.setItem("cineroll_impressed_film_ids", "[\"film-1\"]");

    setCookieConsentChoice("declined");

    expect(getCookieConsentChoice()).toBe("declined");
    expect(window.localStorage.removeItem).toHaveBeenCalledWith("cineroll_anon_id");
    expect(window.sessionStorage.removeItem).toHaveBeenCalledWith("cineroll_session_id");
    expect(window.sessionStorage.removeItem).toHaveBeenCalledWith("cineroll_impressed_film_ids");
    expect(window.dispatchEvent).toHaveBeenCalledWith(expect.any(Event));
  });

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
