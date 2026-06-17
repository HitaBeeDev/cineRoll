export const eventTypes = [
  "roll",
  "roll_personalized",
  "impression",
  "film_click",
  "watchlist_add",
  "watchlist_remove",
  "watched",
  "not_interested",
  "rating_set",
  "sentiment_set",
  "recommendation_served",
  "recommendation_click",
  "search",
  "filter_apply",
  "pick_of_day_click",
] as const;

export type EventType = (typeof eventTypes)[number];

export type TrackEventInput = {
  type: EventType;
  filmId?: string | null;
  context?: Record<string, unknown>;
  variant?: string | null;
};

const ANON_ID_KEY = "cineroll_anon_id";
const SESSION_ID_KEY = "cineroll_session_id";
const IMPRESSED_FILM_IDS_KEY = "cineroll_impressed_film_ids";
export const COOKIE_CONSENT_KEY = "cineroll_cookie_consent";
const CONSENT_GRANTED_VALUES = new Set(["accepted", "granted", "analytics"]);
const FLUSH_INTERVAL_MS = 5_000;
const MAX_BATCH_SIZE = 25;

type QueuedEvent = Required<Pick<TrackEventInput, "type">> & {
  anonId: string;
  sessionId: string;
  filmId: string | null;
  context: Record<string, unknown>;
  variant: string | null;
  consent: "granted";
};

let queue: QueuedEvent[] = [];
let flushTimer: number | null = null;
let listenersBound = false;
let impressedFilmIds: Set<string> | null = null;

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function getStoredId(storage: Storage, key: string): string {
  const existing = storage.getItem(key);
  if (existing) return existing;

  const id = createId();
  storage.setItem(key, id);
  return id;
}

export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  return CONSENT_GRANTED_VALUES.has(
    window.localStorage.getItem(COOKIE_CONSENT_KEY) ?? "",
  );
}

function takeBatch(): QueuedEvent[] {
  return queue.splice(0, MAX_BATCH_SIZE);
}

function sendBeaconBatch(events: QueuedEvent[]): boolean {
  if (!("sendBeacon" in navigator)) return false;

  const body = JSON.stringify(events);
  const payload = new Blob([body], { type: "application/json" });
  return navigator.sendBeacon("/api/events", payload);
}

async function sendFetchBatch(events: QueuedEvent[]): Promise<void> {
  await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(events),
    keepalive: true,
  });
}

function scheduleFlush() {
  if (flushTimer !== null) return;
  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    void flushEvents();
  }, FLUSH_INTERVAL_MS);
}

export async function flushEvents(useBeacon = false): Promise<void> {
  if (typeof window === "undefined") return;
  if (queue.length === 0) return;

  while (queue.length > 0) {
    const batch = takeBatch();

    try {
      if (useBeacon && sendBeaconBatch(batch)) continue;
      await sendFetchBatch(batch);
    } catch {
      queue = [...batch, ...queue].slice(0, MAX_BATCH_SIZE);
      scheduleFlush();
      return;
    }
  }
}

function bindLifecycleFlush() {
  if (listenersBound || typeof window === "undefined") return;
  listenersBound = true;

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      void flushEvents(true);
    }
  });

  window.addEventListener("pagehide", () => {
    void flushEvents(true);
  });
}

export function trackEvent(input: TrackEventInput): void {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;

  try {
    bindLifecycleFlush();
    const anonId = getStoredId(window.localStorage, ANON_ID_KEY);
    const sessionId = getStoredId(window.sessionStorage, SESSION_ID_KEY);

    queue.push({
      anonId,
      sessionId,
      type: input.type,
      filmId: input.filmId ?? null,
      context: input.context ?? {},
      variant: input.variant ?? null,
      consent: "granted",
    });

    if (queue.length >= MAX_BATCH_SIZE) void flushEvents();
    else scheduleFlush();
  } catch {
    // Analytics must never block the product experience.
  }
}

function getImpressedFilmIds(): Set<string> {
  if (impressedFilmIds) return impressedFilmIds;
  if (typeof window === "undefined") return new Set();

  const raw = window.sessionStorage.getItem(IMPRESSED_FILM_IDS_KEY);
  const ids = raw ? JSON.parse(raw) as unknown : [];
  impressedFilmIds = new Set(Array.isArray(ids) ? ids.filter(id => typeof id === "string") : []);
  return impressedFilmIds;
}

function saveImpressedFilmIds(ids: Set<string>) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(IMPRESSED_FILM_IDS_KEY, JSON.stringify([...ids]));
}

export function trackFilmImpression(
  filmId: string,
  context?: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;

  try {
    const ids = getImpressedFilmIds();
    if (ids.has(filmId)) return;

    ids.add(filmId);
    saveImpressedFilmIds(ids);
    trackEvent({
      type: "impression",
      filmId,
      context: {
        source: "film_card",
        ...context,
      },
    });
  } catch {
    // Analytics must never block the product experience.
  }
}

export function trackRatingSet(
  filmId: string,
  rating: number,
  context?: Record<string, unknown>,
): void {
  trackEvent({
    type: "rating_set",
    filmId,
    context: {
      rating,
      ...context,
    },
  });
}

export function trackSentimentSet(
  filmId: string,
  sentiment: string,
  context?: Record<string, unknown>,
): void {
  trackEvent({
    type: "sentiment_set",
    filmId,
    context: {
      sentiment,
      ...context,
    },
  });
}
