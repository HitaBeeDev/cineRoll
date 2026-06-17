import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthedRequest } from "../middleware/auth";
import { recommend } from "../lib/recommender";
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
  res.json(result);
});
