import { Router } from "express";

import { getValidated, validate } from "../../middleware/validate";
import { getUserId } from "./helpers";
import {
  CursorQuery,
  cursorQuerySchema,
  FilmIdBody,
  filmIdBodySchema,
  ListFilmParams,
  listFilmParamsSchema,
  ListIdParams,
  listIdParamsSchema,
  ListNameBody,
  listNameBodySchema,
  ListsQuery,
  listsQuerySchema,
} from "./schemas";
import {
  addFilmToUserList,
  createUserList,
  deleteUserList,
  getUserList,
  listLists,
  removeFilmFromUserList,
  renameUserList,
} from "./listsService";

export const listsRouter = Router();

// GET /lists?filmId= — every list with counts + cover posters; when filmId is
// present each list also carries `containsFilm` for the save popover.
listsRouter.get("/lists", validate(listsQuerySchema, "query"), async (req, res) => {
  const { filmId } = getValidated<ListsQuery>(req, "query");
  res.json(await listLists(getUserId(req), filmId));
});

listsRouter.post("/lists", validate(listNameBodySchema, "body"), async (req, res) => {
  const { name } = getValidated<ListNameBody>(req, "body");
  res.status(201).json(await createUserList(getUserId(req), name));
});

listsRouter.get(
  "/lists/:listId",
  validate(listIdParamsSchema, "params"),
  validate(cursorQuerySchema, "query"),
  async (req, res) => {
    const { listId } = getValidated<ListIdParams>(req, "params");
    const { limit, cursor } = getValidated<CursorQuery>(req, "query");
    res.json(await getUserList(getUserId(req), listId, limit, cursor));
  },
);

listsRouter.patch(
  "/lists/:listId",
  validate(listIdParamsSchema, "params"),
  validate(listNameBodySchema, "body"),
  async (req, res) => {
    const { listId } = getValidated<ListIdParams>(req, "params");
    const { name } = getValidated<ListNameBody>(req, "body");
    res.json(await renameUserList(getUserId(req), listId, name));
  },
);

listsRouter.delete("/lists/:listId", validate(listIdParamsSchema, "params"), async (req, res) => {
  const { listId } = getValidated<ListIdParams>(req, "params");
  await deleteUserList(getUserId(req), listId);
  res.status(204).send();
});

listsRouter.post(
  "/lists/:listId/films",
  validate(listIdParamsSchema, "params"),
  validate(filmIdBodySchema, "body"),
  async (req, res) => {
    const { listId } = getValidated<ListIdParams>(req, "params");
    const { filmId } = getValidated<FilmIdBody>(req, "body");
    res.status(201).json(await addFilmToUserList(getUserId(req), listId, filmId));
  },
);

listsRouter.delete(
  "/lists/:listId/films/:filmId",
  validate(listFilmParamsSchema, "params"),
  async (req, res) => {
    const { listId, filmId } = getValidated<ListFilmParams>(req, "params");
    await removeFilmFromUserList(getUserId(req), listId, filmId);
    res.status(204).send();
  },
);
