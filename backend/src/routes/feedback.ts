import { Router } from "express";
import { z } from "zod";
import { sendFeedbackNotification } from "../lib/feedbackEmail";
import { prisma } from "../lib/prisma";
import { getValidated, validate } from "../middleware/validate";
import { HttpError } from "../middleware/errorHandler";

export const feedbackRouter = Router();

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const RATE_LIMIT_MAX_SUBMISSIONS = 5;

const feedbackBodySchema = z.object({
  email: z.string().trim().email().max(320).optional(),
  body: z.string().trim().min(1).max(2000),
  website: z.string().trim().max(0).optional(),
}).strict();

type FeedbackBody = z.infer<typeof feedbackBodySchema>;
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

function assertRateLimit(ip: string) {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(ip);

  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return;
  }

  if (bucket.count + 1 > RATE_LIMIT_MAX_SUBMISSIONS) {
    throw new HttpError(429, "Too many feedback submissions", "RATE_LIMITED");
  }

  bucket.count += 1;
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
