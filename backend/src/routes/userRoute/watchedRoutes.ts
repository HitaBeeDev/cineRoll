import { Router } from "express";

import { getValidated, validate } from "../../middleware/validate";
import { getUserId } from "./request";
import {
  CursorQuery,
  cursorQuerySchema,
  FilmIdParams,
  filmIdParamsSchema,
  WatchedBody,
  watchedBodySchema,
} from "./schemas";
import {
  listWatched,
  removeWatchedFilm,
  setWatchedFilm,
} from "./watchedService";

export const watchedRouter = Router();

watchedRouter.get("/watched", validate(cursorQuerySchema, "query"), async (req, res) => {
  const { limit, cursor } = getValidated<CursorQuery>(req, "query");

  res.json(await listWatched(getUserId(req), limit, cursor));
});

watchedRouter.post("/watched", validate(watchedBodySchema, "body"), async (req, res) => {
  const { filmId, doNotSuggest, sentiment } = getValidated<WatchedBody>(req, "body");

  res.json(await setWatchedFilm(getUserId(req), filmId, doNotSuggest, sentiment));
});

watchedRouter.delete("/watched/:filmId", validate(filmIdParamsSchema, "params"), async (req, res) => {
  const { filmId } = getValidated<FilmIdParams>(req, "params");

  await removeWatchedFilm(getUserId(req), filmId);
  res.status(204).send();
});
