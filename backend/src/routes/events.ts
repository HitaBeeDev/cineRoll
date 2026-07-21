import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { sanitizeContext } from "../lib/events";
import { assignVariant } from "../lib/experiments";
import { prisma } from "../lib/prisma";
import { optionalAuth, OptionallyAuthedRequest } from "../middleware/auth";
import { HttpError } from "../middleware/errorHandler";
import { getValidated, validate } from "../middleware/validate";

export const eventsRouter = Router();

const MAX_BATCH_SIZE = 25;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_EVENTS = 120;

const eventTypes = [
  "roll",
  "roll_personalized",
  "impression",
  "film_click",
  "watchlist_add",
  "watchlist_remove",
  "watched",
  "not_interested",
  "sentiment_set",
  "recommendation_served",
  "recommendation_click",
  "search",
  "filter_apply",
  "pick_of_day_click",
] as const;

const eventBodySchema = z.object({
  anonId: z.string().trim().min(1).max(128).nullable().optional(),
  sessionId: z.string().trim().min(1).max(128),
  type: z.enum(eventTypes),
  filmId: z.string().trim().min(1).nullable().optional(),
  context: z.record(z.string(), z.unknown()).default({}),
  variant: z.string().trim().min(1).max(128).nullable().optional(),
  consent: z.enum(["granted", "denied"]).default("denied"),
}).strict();

const eventBatchBodySchema = z.array(eventBodySchema).min(1).max(MAX_BATCH_SIZE);

type EventBody = z.infer<typeof eventBodySchema>;
type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const rateLimitBuckets = new Map<string, RateLimitBucket>();

function getClientIp(req: Parameters<typeof getValidated>[0]): string {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string") {
    return forwardedFor.split(",")[0]?.trim() || req.ip || "unknown";
  }

  return req.ip || "unknown";
}

function assertRateLimit(ip: string, eventCount: number) {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(ip);

  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(ip, {
      count: eventCount,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return;
  }

  if (bucket.count + eventCount > RATE_LIMIT_MAX_EVENTS) {
    throw new HttpError(429, "Too many events", "RATE_LIMITED");
  }

  bucket.count += eventCount;
}

eventsRouter.post(
  "/",
  optionalAuth,
  validate(eventBatchBodySchema, "body"),
  async (req, res) => {
    const userId = (req as OptionallyAuthedRequest).userId;
    const events = getValidated<EventBody[]>(req, "body");
    assertRateLimit(getClientIp(req), events.length);
    const consentedEvents = events.filter(event => event.consent === "granted");

    if (consentedEvents.length === 0) {
      res.status(202).json({ count: 0, dropped: events.length });
      return;
    }

    const filmIds = [...new Set(consentedEvents.flatMap(event => event.filmId ? [event.filmId] : []))];

    if (filmIds.length > 0) {
      const films = await prisma.film.findMany({
        where: { id: { in: filmIds } },
        select: { id: true },
      });
      const foundFilmIds = new Set(films.map(film => film.id));
      const missingFilmId = filmIds.find(filmId => !foundFilmIds.has(filmId));
      if (missingFilmId) throw new HttpError(404, "Film not found", "FILM_NOT_FOUND");
    }

    const result = await prisma.event.createMany({
      data: consentedEvents.map(event => ({
        userId: userId ?? null,
        anonId: event.anonId ?? null,
        sessionId: event.sessionId,
        type: event.type,
        filmId: event.filmId ?? null,
        context: sanitizeContext(event.context) as Prisma.InputJsonValue,
        // Variant is assigned server-side from the actor id, not trusted from
        // the client — deterministic bucketing tags every event.
        variant: assignVariant(userId ?? event.anonId ?? null),
      })),
    });

    res.status(201).json({ count: result.count, dropped: events.length - result.count });
  },
);
