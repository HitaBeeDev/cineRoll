import type { NextFunction, Request, Response } from "express";
import { config } from "../config";

export function slowRequestLogger(req: Request, res: Response, next: NextFunction) {
  const start = performance.now();

  res.on("finish", () => {
    const duration = performance.now() - start;
    if (duration >= config.slowRequestThresholdMs) {
      console.warn(
        `Slow HTTP request: ${duration.toFixed(1)}ms threshold=${config.slowRequestThresholdMs}ms method=${req.method} path=${req.originalUrl} status=${res.statusCode}`,
      );
    }
  });

  next();
}
