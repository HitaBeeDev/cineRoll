import { Router } from "express";

import { setPublicCache } from "../../lib/cache";
import { getValidated, validate } from "../../middleware/validate";
import { getPersonProfile } from "./personService";
import { PersonParams, personParamsSchema } from "./schemas";

export const personProfileRouter = Router();

personProfileRouter.get("/:slug", validate(personParamsSchema, "params"), async (req, res) => {
  const { slug } = getValidated<PersonParams>(req, "params");

  setPublicCache(res, 3600);
  res.json(await getPersonProfile(slug));
});
