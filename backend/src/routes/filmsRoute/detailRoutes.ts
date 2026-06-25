import { Router } from "express";

import { setPublicCache } from "../../lib/cache";
import { HttpError } from "../../middleware/errorHandler";
import { getValidated, validate } from "../../middleware/validate";
import { getFilmDetail } from "./detailService";
import { slugParamsSchema, SlugParams } from "./schemas";

export const filmDetailRouter = Router();

filmDetailRouter.get("/:slug", validate(slugParamsSchema, "params"), async (req, res) => {
  const { slug } = getValidated<SlugParams>(req, "params");
  const payload = await getFilmDetail(slug);

  if (!payload) {
    throw new HttpError(404, "Film not found", "FILM_NOT_FOUND");
  }

  setPublicCache(res, 300);
  res.json(payload);
});
