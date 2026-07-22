import type { eventTypes } from "./event-types";

export type EventType = (typeof eventTypes)[number];

export type TrackEventInput = {
  type: EventType;
  filmId?: string | null;
  context?: Record<string, unknown>;
  variant?: string | null;
};

export type QueuedEvent = {
  anonId: string;
  sessionId: string;
  type: EventType;
  filmId: string | null;
  context: Record<string, unknown>;
  variant: string | null;
  consent: "granted";
};

export type CookieConsentChoice = "granted" | "declined";
