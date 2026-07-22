import { Router } from "express";

import { getValidated, validate } from "../../middleware/validate";
import { getUserId } from "./helpers";
import { OnboardingBody, onboardingBodySchema } from "./schemas";
import { saveOnboardingGenres } from "./onboardingService";

export const onboardingRouter = Router();

onboardingRouter.post("/onboarding", validate(onboardingBodySchema, "body"), async (req, res) => {
  const userId = getUserId(req);
  const { genres } = getValidated<OnboardingBody>(req, "body");

  await saveOnboardingGenres(userId, genres);
  res.status(204).send();
});
