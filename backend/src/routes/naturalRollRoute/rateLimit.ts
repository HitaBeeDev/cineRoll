import { HttpError } from "../../middleware/errorHandler";
import { FixedWindowCounter } from "../../middleware/rateLimit";
import { NATURAL_ROLL_LIMITS } from "./constants";
import { NaturalRollBody } from "./schemas";

// A stricter sub-limit layered on top of the global API rate limit, scoped to
// the costly Gemini-backed natural-roll path (two LLM round-trips per call).
//
// SINGLE-INSTANCE ASSUMPTION: this counter lives in process memory, so the
// budget holds per instance, not across a horizontally-scaled fleet — N pods
// means an effective N× limit. It reuses the shared FixedWindowCounter (which
// self-evicts expired keys, so the store can't grow unbounded) precisely so
// that swapping to a distributed store later is a single, central change.
const naturalRollCounter = new FixedWindowCounter(
  NATURAL_ROLL_LIMITS.rateLimitWindowMs,
  NATURAL_ROLL_LIMITS.rateLimitMax,
);

export function rateLimitKey(body: NaturalRollBody, reqIp: string | undefined): string {
  return body.userId ? `user:${body.userId}` : `ip:${reqIp ?? "unknown"}`;
}

export function assertWithinNaturalRollRateLimit(key: string): void {
  if (naturalRollCounter.hit(key).limited) {
    throw new HttpError(429, "Natural roll limit reached. Try again later.", "RATE_LIMITED");
  }
}
