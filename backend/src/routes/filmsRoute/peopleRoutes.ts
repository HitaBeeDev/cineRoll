import { Router } from "express";

import { setPublicCache } from "../../lib/cache";
import { getValidated, validate } from "../../middleware/validate";
import { peopleQuerySchema, PeopleQuery } from "./schemas";
import { searchPeople } from "./peopleRepository";

export const peopleRouter = Router();

peopleRouter.get("/people", validate(peopleQuerySchema), async (req, res) => {
  const { query, limit } = getValidated<PeopleQuery>(req, "query");

  setPublicCache(res, 300);
  res.json({ people: await searchPeople(query, limit) });
});
