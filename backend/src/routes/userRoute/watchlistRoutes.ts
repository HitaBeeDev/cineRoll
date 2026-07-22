import { Router } from "express";

import { getValidated, validate } from "../../middleware/validate";
import { getUserId } from "./helpers";
import {
  CursorQuery,
  cursorQuerySchema,
  FilmIdBody,
  filmIdBodySchema,
  FilmIdParams,
  filmIdParamsSchema,
} from "./schemas";
import {
  addWatchlistFilm,
  listWatchlist,
  removeWatchlistFilm,
} from "./watchlistService";

export const watchlistRouter = Router();

watchlistRouter.get("/watchlist", validate(cursorQuerySchema, "query"), async (req, res) => {
  const { limit, cursor } = getValidated<CursorQuery>(req, "query");

  res.json(await listWatchlist(getUserId(req), limit, cursor));
});

watchlistRouter.post("/watchlist", validate(filmIdBodySchema, "body"), async (req, res) => {
  const { filmId } = getValidated<FilmIdBody>(req, "body");

  res.status(201).json(await addWatchlistFilm(getUserId(req), filmId));
});

watchlistRouter.delete("/watchlist/:filmId", validate(filmIdParamsSchema, "params"), async (req, res) => {
  const { filmId } = getValidated<FilmIdParams>(req, "params");

  await removeWatchlistFilm(getUserId(req), filmId);
  res.status(204).send();
});
