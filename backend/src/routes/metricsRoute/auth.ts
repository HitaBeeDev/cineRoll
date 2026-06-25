import type { NextFunction, Request, Response } from "express";

import { config } from "../../config";
import { HttpError } from "../../middleware/errorHandler";

export function requireMetricsToken(req: Request, _res: Response, next: NextFunction): void {
  if (!config.metricsToken) {
    throw new HttpError(503, "Metrics are not enabled", "METRICS_DISABLED");
  }

  const token = bearerToken(req.headers.authorization);
  if (!token || token !== config.metricsToken) {
    throw new HttpError(401, "Unauthorized", "INVALID_METRICS_TOKEN");
  }

  next();
}

function bearerToken(header: string | undefined): string | null {
  return header?.startsWith("Bearer ") ? header.slice(7).trim() : null;
}
