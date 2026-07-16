import { Router, Response } from "express";

import { getValidated, validate } from "../middleware/validate";
import {
  assertWithinNaturalRollRateLimit,
  rateLimitKey,
} from "./naturalRollRoute/rateLimit";
import { naturalRollBodySchema, NaturalRollBody } from "./naturalRollRoute/schemas";
import { interpretNaturalRoll, rankNaturalRoll } from "./naturalRollRoute/service";

export const naturalRollRouter = Router();

// `compression()` (mounted globally) buffers the response body, so a small first
// chunk would sit in its buffer until the response ends — defeating progressive
// streaming. The middleware decorates `res` with `flush()`; calling it after
// each line pushes the chunk through immediately.
function writeEvent(res: Response, event: unknown): void {
  res.write(`${JSON.stringify(event)}\n`);
  (res as Response & { flush?: () => void }).flush?.();
}

naturalRollRouter.post("/", validate(naturalRollBodySchema, "body"), async (req, res) => {
  const body = getValidated<NaturalRollBody>(req, "body");
  assertWithinNaturalRollRateLimit(rateLimitKey(body, req.ip));

  // Phase 1 runs before any bytes are sent, so a failure here (DB, etc.) still
  // routes to the normal error handler with a clean status code.
  const interpreted = await interpretNaturalRoll(body);

  // From here on the response is a stream of newline-delimited JSON events:
  //   { type: "interpreted", interpretedFilters, relaxed, total, resultCount }
  //   { type: "result", films, total, interpretedFilters, droppedFilters, relaxed }
  //   { type: "error", error, code, interpretedFilters?, droppedFilters? }
  // Because the status line is already 200 once streaming starts, the no-match
  // and rerank-failure cases are reported in-band as `error` events.
  res.status(200);
  res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");

  if (!interpreted.ok) {
    writeEvent(res, { type: "error", ...interpreted.error });
    res.end();
    return;
  }

  const { candidateResult, preferences, resultCount } = interpreted;
  writeEvent(res, {
    type: "interpreted",
    interpretedFilters: candidateResult.appliedFilters,
    relaxed: candidateResult.relaxed,
    total: candidateResult.total,
    resultCount,
  });

  try {
    const payload = await rankNaturalRoll(body.prompt, preferences, candidateResult, resultCount);
    writeEvent(res, { type: "result", ...payload });
  } catch (error) {
    console.error("Natural roll rerank failed mid-stream.", error);
    writeEvent(res, { type: "error", error: "Ranking failed", code: "RANK_FAILED" });
  }

  res.end();
});
