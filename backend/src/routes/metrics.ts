import { Router } from "express";
import { z } from "zod";

import { getValidated, validate } from "../middleware/validate";
import { requireMetricsToken } from "./metricsRoute/auth";
import { getRecommendationMetrics } from "./metricsRoute/recommendationMetricsService";
import { getRollMetrics } from "./metricsRoute/rollMetricsService";

const metricsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional(),
});
type MetricsQuery = z.infer<typeof metricsQuerySchema>;

export const metricsRouter = Router();

metricsRouter.use(requireMetricsToken);

metricsRouter.get("/recommendations", validate(metricsQuerySchema, "query"), async (req, res) => {
  const { days } = getValidated<MetricsQuery>(req, "query");

  res.json(await getRecommendationMetrics(days));
});

metricsRouter.get("/rolls", validate(metricsQuerySchema, "query"), async (req, res) => {
  const { days } = getValidated<MetricsQuery>(req, "query");

  res.json(await getRollMetrics(days));
});
