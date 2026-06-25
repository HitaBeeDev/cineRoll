import { HttpError } from "../../middleware/errorHandler";
import { NATURAL_ROLL_LIMITS } from "./constants";
import { NaturalRollBody } from "./schemas";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const rateLimitBuckets = new Map<string, RateLimitBucket>();

export function rateLimitKey(body: NaturalRollBody, reqIp: string | undefined): string {
  return body.userId ? `user:${body.userId}` : `ip:${reqIp ?? "unknown"}`;
}

export function assertWithinNaturalRollRateLimit(key: string): void {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(key, {
      count: 1,
      resetAt: now + NATURAL_ROLL_LIMITS.rateLimitWindowMs,
    });
    return;
  }

  if (bucket.count >= NATURAL_ROLL_LIMITS.rateLimitMax) {
    throw new HttpError(429, "Natural roll limit reached. Try again later.", "RATE_LIMITED");
  }

  bucket.count += 1;
}
