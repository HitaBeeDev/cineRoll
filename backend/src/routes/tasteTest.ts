import { Router } from "express";

import { getValidated, validate } from "../middleware/validate";
import {
  averageVectors,
  filmToVector,
  matchArchetype,
  profileTraits,
} from "./tasteTestRoute/model";
import { buildQuestions } from "./tasteTestRoute/questions";
import { recommend } from "./tasteTestRoute/recommend";
import { getCandidatePool, getFilmsByIds } from "./tasteTestRoute/repository";
import { ResultBody, resultBodySchema } from "./tasteTestRoute/schemas";

export const tasteTestRouter = Router();

// GET /api/taste-test/questions — ten this-or-that poster pairs for the quiz.
tasteTestRouter.get("/questions", async (_req, res) => {
  const pool = await getCandidatePool();
  res.json({ questions: buildQuestions(pool) });
});

// POST /api/taste-test/result — the picks in, an archetype + recommendations out.
// Stateless: the client sends the ids it chose, we recompute everything server
// side so the model stays the single source of truth.
tasteTestRouter.post("/result", validate(resultBodySchema, "body"), async (req, res) => {
  const { choiceFilmIds } = getValidated<ResultBody>(req, "body");

  const chosen = await getFilmsByIds(choiceFilmIds);
  const profile = averageVectors(chosen.map(filmToVector));
  const archetype = matchArchetype(profile);

  const pool = await getCandidatePool();
  const { hero, byType } = recommend(profile, pool, new Set(choiceFilmIds));

  res.json({
    archetype: {
      key: archetype.key,
      label: archetype.label,
      emoji: archetype.emoji,
      blurb: archetype.blurb,
    },
    traits: profileTraits(profile),
    profile,
    hero,
    recommendations: byType,
  });
});
