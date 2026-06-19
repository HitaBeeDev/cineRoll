import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { recommend } from "../lib/recommender";
import { logEvent } from "../lib/events";
import { getValidated, validate } from "../middleware/validate";

export const recommendationsRouter = Router();

recommendationsRouter.use(requireAuth);

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(24).default(6),
});

// GET /api/recommendations?limit=6
// Content-based pipeline: candidate generation → taste scoring → MMR diversity
// re-rank → reasons. Returns NOT_ENOUGH_DATA for cold-start users with no
// onboarding seed; otherwise top-N with score + reason.
recommendationsRouter.get("/", validate(querySchema, "query"), async (req, res) => {
  const userId = (req as AuthedRequest).userId;
  const { limit } = getValidated<z.infer<typeof querySchema>>(req, "query");

  const result = await recommend(userId, limit);

  if ("code" in result) {
    res.status(200).json(result);
    return;
  }

  // Ground truth for the evaluation harness (section 12): what was served, in
  // what order, with what scores and model version.
  await logEvent({
    type: "recommendation_served",
    userId,
    variant: result.variant,
    context: {
      modelVersion: result.modelVersion,
      coldStart: result.coldStart,
      filmIds: result.recommendations.map((r) => r.id),
      scores: result.recommendations.map((r) => r.score),
    },
  });

  res.json(result);
});
