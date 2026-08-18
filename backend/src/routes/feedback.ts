import { Router } from "express";
import { z } from "zod";
import { sendFeedbackNotification } from "../lib/feedbackEmail";
import { prisma } from "../lib/prisma";
import { getValidated, validate } from "../middleware/validate";
import { HttpError } from "../middleware/errorHandler";
import { FixedWindowCounter, getClientIp } from "../middleware/rateLimit";

export const feedbackRouter = Router();

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_SUBMISSIONS = 5;

const feedbackBodySchema = z.object({
  email: z.string().trim().email().max(320).optional(),
  body: z.string().trim().min(1).max(2000),
  website: z.string().trim().max(0).optional(),
}).strict();

type FeedbackBody = z.infer<typeof feedbackBodySchema>;

/**
 * A stricter sub-limit on feedback submissions, layered over the global API
 * limiter: each one writes a row and sends a notification email, so it is a
 * spam target in a way read endpoints are not.
 *
 * SINGLE-INSTANCE ASSUMPTION, as with the natural-roll and export limiters:
 * the counter lives in process memory, so N instances means an effective N×
 * budget. It reuses the shared FixedWindowCounter so there is one store to
 * swap for Redis.
 */
const feedbackCounter = new FixedWindowCounter(RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_SUBMISSIONS);

function assertRateLimit(ip: string) {
  if (feedbackCounter.hit(`feedback:${ip}`).limited) {
    throw new HttpError(429, "Too many feedback submissions", "RATE_LIMITED");
  }
}

feedbackRouter.post("/", validate(feedbackBodySchema, "body"), async (req, res) => {
  assertRateLimit(getClientIp(req));
  const { email, body } = getValidated<FeedbackBody>(req, "body");

  const feedback = await prisma.siteFeedback.create({
    data: {
      email: email ?? null,
      body,
    },
    select: {
      id: true,
      createdAt: true,
    },
  });

  const feedbackEmail = email ?? null;
  void sendFeedbackNotification({
    email: feedbackEmail,
    body,
    feedbackId: feedback.id,
  }).catch((error: unknown) => {
    console.error("Failed to send feedback notification", error);
  });

  res.status(201).json(feedback);
});
