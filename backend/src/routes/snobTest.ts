import { Router } from "express";

import { getValidated, validate } from "../middleware/validate";
import { getScoreFilms, getSnobTestFilms } from "./snobTestRoute/filmRepository";
import {
  FilmsQuery,
  filmsQuerySchema,
  ScoreBody,
  scoreBodySchema,
} from "./snobTestRoute/schemas";
import { scoreSnobTest } from "./snobTestRoute/scoring";

export const snobTestRouter = Router();

snobTestRouter.get("/films", validate(filmsQuerySchema), async (req, res) => {
  const { excludeFilmIds } = getValidated<FilmsQuery>(req, "query");

  res.json({ films: await getSnobTestFilms(excludeFilmIds) });
});

snobTestRouter.post("/score", validate(scoreBodySchema, "body"), async (req, res) => {
  const { seenFilmIds } = getValidated<ScoreBody>(req, "body");
  const films = await getScoreFilms(seenFilmIds);

  res.json(scoreSnobTest(films));
});
