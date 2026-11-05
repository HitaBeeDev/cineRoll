import type { NextFunction, Request, Response } from "express";

import { config } from "../../config";
import { HttpError } from "../../middleware/errorHandler";

/** Vercel cron calls with `Authorization: Bearer $CRON_SECRET`; nothing else may. */
export function requireCronSecret(req: Request, _res: Response, next: NextFunction): void {
  if (!config.cronSecret) {
    throw new HttpError(503, "Scheduled jobs are not enabled", "JOBS_DISABLED");
  }
  if (req.headers.authorization !== `Bearer ${config.cronSecret}`) {
    throw new HttpError(401, "Unauthorized", "INVALID_CRON_SECRET");
  }
  next();
}
