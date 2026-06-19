import { Router } from "express";
import { z } from "zod";
import { sendFeedbackNotification } from "../lib/feedbackEmail";
import { prisma } from "../lib/prisma";
import { getValidated, validate } from "../middleware/validate";

export const feedbackRouter = Router();

const feedbackBodySchema = z.object({
  email: z.string().trim().email().max(320).optional(),
  body: z.string().trim().min(1).max(2000),
}).strict();

feedbackRouter.post("/", validate(feedbackBodySchema, "body"), async (req, res) => {
  const { email, body } = getValidated<z.infer<typeof feedbackBodySchema>>(req, "body");

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
