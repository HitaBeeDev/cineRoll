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
  const { seenFilmIds, ballotFilmIds } = getValidated<ScoreBody>(req, "body");
  // IRT needs the whole administered ballot; older clients only send the seen
  // subset, so fall back to that (score then degrades to a difficulty-agnostic
  // estimate rather than breaking).
  const ballotIds = ballotFilmIds.length > 0 ? ballotFilmIds : seenFilmIds;
  const ballot = await getScoreFilms(ballotIds);

  res.json(scoreSnobTest(ballot, new Set(seenFilmIds)));
});
