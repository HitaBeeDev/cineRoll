import { Router } from "express";

import { setPublicCache } from "../../lib/cache";
import { HttpError } from "../../middleware/errorHandler";
import { getValidated, validate } from "../../middleware/validate";
import { slugParamsSchema, SlugParams } from "./schemas";
import { getSimilarFilms } from "./similarRepository";

export const similarFilmsRouter = Router();

similarFilmsRouter.get("/:slug/similar", validate(slugParamsSchema, "params"), async (req, res) => {
  const { slug } = getValidated<SlugParams>(req, "params");
  const films = await getSimilarFilms(slug);

  if (films === null) {
    throw new HttpError(404, "Film not found", "FILM_NOT_FOUND");
  }

  setPublicCache(res, 3600);
  res.json(films);
});
