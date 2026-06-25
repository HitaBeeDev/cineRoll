import { z } from "zod";

export const metricsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional(),
});

export type MetricsQuery = z.infer<typeof metricsQuerySchema>;
