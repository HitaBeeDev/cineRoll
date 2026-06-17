export const eventTypes = [
  "PAGE_VIEW",
  "FILM_VIEW",
  "ROLL_REQUESTED",
  "ROLL_RESULT_VIEWED",
  "NATURAL_ROLL_REQUESTED",
  "SEARCH",
  "FILTER_APPLIED",
  "WATCHLIST_ADD",
  "WATCHLIST_REMOVE",
  "WATCHED_ADD",
  "WATCHED_REMOVE",
  "NOT_INTERESTED",
  "SHARE",
  "TRAILER_PLAY",
  "PROVIDER_CLICK",
  "SNOB_TEST_COMPLETED",
  "ROLL_BATTLE_COMPLETED",
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

export async function trackEvent(input: TrackEventInput): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const anonId = getStoredId(window.localStorage, ANON_ID_KEY);
    const sessionId = getStoredId(window.sessionStorage, SESSION_ID_KEY);

    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        anonId,
        sessionId,
        type: input.type,
        filmId: input.filmId ?? null,
        context: input.context ?? {},
        variant: input.variant ?? null,
      }),
      keepalive: true,
    });
  } catch {
    // Analytics must never block the product experience.
  }
}
