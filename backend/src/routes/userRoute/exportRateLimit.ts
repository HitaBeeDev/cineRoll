import { HttpError } from "../../middleware/errorHandler";
import { FixedWindowCounter } from "../../middleware/rateLimit";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 5;

/**
 * A stricter sub-limit on the export endpoint, layered over the global API
 * limiter. One export reads every row the account owns across five tables, so
 * it is far heavier than the CRUD calls the global budget is sized for, and
 * nobody has a legitimate reason to ask for their data more than a handful of
 * times an hour.
 *
 * SINGLE-INSTANCE ASSUMPTION, as with the natural-roll limiter: the counter
 * lives in process memory, so N instances means an effective N× budget. It
 * reuses the shared FixedWindowCounter so there is one store to swap for Redis.
 */
const exportCounter = new FixedWindowCounter(WINDOW_MS, MAX_PER_WINDOW);

export function assertWithinExportRateLimit(userId: string): void {
  if (exportCounter.hit(`export:${userId}`).limited) {
    throw new HttpError(429, "Too many export requests. Try again later.", "RATE_LIMITED");
  }
}
