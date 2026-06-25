import { Router } from "express";

import { listQuerySchema, ListQuery } from "../../lib/filmFilters/listQuerySchema";
import { setPublicCache } from "../../lib/cache";
import { getValidated, validate } from "../../middleware/validate";
import { getFilmList } from "./listRepository";

export const filmListRouter = Router();

filmListRouter.get("/", validate(listQuerySchema), async (req, res) => {
  const query = getValidated<ListQuery>(req, "query");
  const payload = await getFilmList(query);

  if (query.sample !== "onboarding") {
    setPublicCache(res, 300);
  }

  res.json(payload);
});
