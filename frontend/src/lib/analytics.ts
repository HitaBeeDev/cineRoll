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
export const COOKIE_CONSENT_KEY = "cineroll_cookie_consent";
const CONSENT_GRANTED_VALUES = new Set(["accepted", "granted", "analytics"]);

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

export async function trackEvent(input: TrackEventInput): Promise<void> {
  if (typeof window === "undefined") return;
  if (!hasAnalyticsConsent()) return;

  try {
    const anonId = getStoredId(window.localStorage, ANON_ID_KEY);
    const sessionId = getStoredId(window.sessionStorage, SESSION_ID_KEY);

    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([{
        anonId,
        sessionId,
        type: input.type,
        filmId: input.filmId ?? null,
        context: input.context ?? {},
        variant: input.variant ?? null,
        consent: "granted",
      }]),
      keepalive: true,
    });
  } catch {
    // Analytics must never block the product experience.
  }
}
