import { Router } from "express";

import { getValidated, validate } from "../middleware/validate";
import { requireMetricsToken } from "./metricsRoute/auth";
import { getRecommendationMetrics } from "./metricsRoute/recommendationMetricsService";
import { getRollMetrics } from "./metricsRoute/rollMetricsService";
import { MetricsQuery, metricsQuerySchema } from "./metricsRoute/schemas";

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
