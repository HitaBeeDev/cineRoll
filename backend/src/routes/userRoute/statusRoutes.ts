import { Router } from "express";

import { getValidated, validate } from "../../middleware/validate";
import { getUserId } from "./request";
import { FilmIdParams, filmIdParamsSchema } from "./schemas";
import { getFilmStatus, getUserSummary } from "./statusRepository";

export const statusRouter = Router();

statusRouter.get("/summary", async (req, res) => {
  res.json(await getUserSummary(getUserId(req)));
});

statusRouter.get("/film-status/:filmId", validate(filmIdParamsSchema, "params"), async (req, res) => {
  const { filmId } = getValidated<FilmIdParams>(req, "params");

  res.json(await getFilmStatus(getUserId(req), filmId));
});
