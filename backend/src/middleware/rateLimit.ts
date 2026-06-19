import type { NextFunction, Request, Response } from "express";
import { config } from "../config";
import type { OptionallyAuthedRequest } from "./auth";
import { HttpError } from "./errorHandler";

// Global API rate limiting. Two independent fixed windows per request: one keyed
// by client IP (covers anonymous abuse) and, when the request is authenticated,
// one keyed by userId (covers a single account hammering from many IPs). The
// per-user budget is higher than per-IP since one account may legitimately share
// an IP with others (NAT) and drive more traffic.
//
// In-memory now; the bucket store is the only thing to swap for Redis to make
// limits hold across multiple instances.

type Bucket = { count: number; resetAt: number };

class FixedWindowCounter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(
    private readonly windowMs: number,
    private readonly max: number,
  ) {}

  /** Record a hit and report whether the key is now over budget. */
  hit(key: string): { limited: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    let bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + this.windowMs };
      this.buckets.set(key, bucket);
    }
    bucket.count += 1;
    if (this.buckets.size > 50_000) this.sweep(now);
    return {
      limited: bucket.count > this.max,
      remaining: Math.max(0, this.max - bucket.count),
      resetAt: bucket.resetAt,
    };
  }

  private sweep(now: number): void {
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
  }
}

const ipCounter = new FixedWindowCounter(config.rateLimit.windowMs, config.rateLimit.maxPerIp);
const userCounter = new FixedWindowCounter(config.rateLimit.windowMs, config.rateLimit.maxPerUser);

function getClientIp(req: Request): string {
  const forwardedFor = req.headers["x-forwarded-for"];
  if (typeof forwardedFor === "string") {
    return forwardedFor.split(",")[0]?.trim() || req.ip || "unknown";
  }
  return req.ip || "unknown";
}

function reject(res: Response, resetAt: number): HttpError {
  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  res.set("Retry-After", String(retryAfter));
  return new HttpError(429, "Too many requests", "RATE_LIMITED");
}

export function globalRateLimit(req: Request, res: Response, next: NextFunction): void {
  if (config.rateLimit.disabled) {
    next();
    return;
  }

  const ipResult = ipCounter.hit(`ip:${getClientIp(req)}`);
  res.set("RateLimit-Limit", String(config.rateLimit.maxPerIp));
  res.set("RateLimit-Remaining", String(ipResult.remaining));
  if (ipResult.limited) {
    next(reject(res, ipResult.resetAt));
    return;
  }

  // Populated by optionalAuth, which runs ahead of this middleware.
  const userId = (req as OptionallyAuthedRequest).userId;
  if (userId) {
    const userResult = userCounter.hit(`user:${userId}`);
    if (userResult.limited) {
      next(reject(res, userResult.resetAt));
      return;
    }
  }

  next();
}
