import { Router } from "express";

import { getValidated, validate } from "../../middleware/validate";
import { getUserId } from "./request";
import {
  FilmIdParams,
  filmIdParamsSchema,
  RatingBody,
  ratingBodySchema,
} from "./schemas";
import { getRating, removeRating, setRating } from "./ratingService";

export const ratingsRouter = Router();

ratingsRouter.post("/ratings", validate(ratingBodySchema, "body"), async (req, res) => {
  const { filmId, rating } = getValidated<RatingBody>(req, "body");

  res.json(await setRating(getUserId(req), filmId, rating));
});

ratingsRouter.get("/ratings/:filmId", validate(filmIdParamsSchema, "params"), async (req, res) => {
  const { filmId } = getValidated<FilmIdParams>(req, "params");

  res.json(await getRating(getUserId(req), filmId));
});

ratingsRouter.delete("/ratings/:filmId", validate(filmIdParamsSchema, "params"), async (req, res) => {
  const { filmId } = getValidated<FilmIdParams>(req, "params");

  await removeRating(getUserId(req), filmId);
  res.status(204).send();
});
