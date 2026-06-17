import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { optionalAuth, OptionallyAuthedRequest } from "../middleware/auth";
import { HttpError } from "../middleware/errorHandler";
import { getValidated, validate } from "../middleware/validate";

export const eventsRouter = Router();

const eventTypes = [
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

const eventBodySchema = z.object({
  anonId: z.string().trim().min(1).max(128).nullable().optional(),
  sessionId: z.string().trim().min(1).max(128),
  type: z.enum(eventTypes),
  filmId: z.string().trim().min(1).nullable().optional(),
  context: z.record(z.string(), z.unknown()).default({}),
  variant: z.string().trim().min(1).max(128).nullable().optional(),
}).strict();

eventsRouter.post(
  "/",
  optionalAuth,
  validate(eventBodySchema, "body"),
  async (req, res) => {
    const userId = (req as OptionallyAuthedRequest).userId;
    const body = getValidated<z.infer<typeof eventBodySchema>>(req, "body");

    if (body.filmId) {
      const film = await prisma.film.findUnique({
        where: { id: body.filmId },
        select: { id: true },
      });

      if (!film) {
        throw new HttpError(404, "Film not found", "FILM_NOT_FOUND");
      }
    }

    const event = await prisma.event.create({
      data: {
        userId: userId ?? null,
        anonId: body.anonId ?? null,
        sessionId: body.sessionId,
        type: body.type,
        filmId: body.filmId ?? null,
        context: body.context as Prisma.InputJsonValue,
        variant: body.variant ?? null,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    res.status(201).json({ event });
  },
);
