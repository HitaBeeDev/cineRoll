import { Router } from "express";

import { getValidated, validate } from "../middleware/validate";
import {
  assertWithinNaturalRollRateLimit,
  rateLimitKey,
} from "./naturalRollRoute/rateLimit";
import { naturalRollBodySchema, NaturalRollBody } from "./naturalRollRoute/schemas";
import { naturalRoll } from "./naturalRollRoute/service";

export const naturalRollRouter = Router();

naturalRollRouter.post("/", validate(naturalRollBodySchema, "body"), async (req, res) => {
  const body = getValidated<NaturalRollBody>(req, "body");
  assertWithinNaturalRollRateLimit(rateLimitKey(body, req.ip));
  const result = await naturalRoll(body);

  if (!result.ok) {
    res.status(404).json(result.error);
    return;
  }

  res.json(result.payload);
});
