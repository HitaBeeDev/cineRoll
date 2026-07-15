import { Router } from "express";

import { getValidated, validate } from "../middleware/validate";
import {
  Comparison,
  filmToVector,
  matchArchetype,
  profileFromComparisons,
  TasteVector,
} from "./tasteTestRoute/model";
import { buildQuestions } from "./tasteTestRoute/questions";
import { recommend } from "./tasteTestRoute/recommend";
import { getCandidatePool, getFilmsByIds } from "./tasteTestRoute/repository";
import { ResultBody, resultBodySchema } from "./tasteTestRoute/schemas";

export const tasteTestRouter = Router();

// GET /api/taste-test/questions — ten comparable this-or-that poster pairs.
tasteTestRouter.get("/questions", async (_req, res) => {
  const pool = await getCandidatePool();
  res.json({ questions: buildQuestions(pool) });
});

// POST /api/taste-test/result — the answered pairs in, an archetype +
// recommendations out. Stateless: the client sends the (chosen, rejected) pair
// for each question and we recompute everything, so the model stays the single
// source of truth.
tasteTestRouter.post("/result", validate(resultBodySchema, "body"), async (req, res) => {
  const { comparisons } = getValidated<ResultBody>(req, "body");

  const involvedIds = [
    ...new Set(comparisons.flatMap((c) => [c.chosenId, c.otherId])),
  ];
  const films = await getFilmsByIds(involvedIds);
  const vectorById = new Map<string, TasteVector>(
    films.map((f) => [f.id, filmToVector(f)]),
  );

  // Keep only fully-resolved pairs (an id could 404 if the catalog changed).
  const resolved: Comparison[] = comparisons.flatMap((c) => {
    const chosen = vectorById.get(c.chosenId);
    const other = vectorById.get(c.otherId);
    return chosen && other ? [{ chosen, other }] : [];
  });

  const profile = profileFromComparisons(resolved);
  const archetype = matchArchetype(profile);

  const pool = await getCandidatePool();
  const { hero, byType } = recommend(profile, pool, new Set(involvedIds));

  res.json({
    archetype: {
      key: archetype.key,
      label: archetype.label,
      emoji: archetype.emoji,
      blurb: archetype.blurb,
    },
    traits: archetype.tags,
    profile,
    hero,
    recommendations: byType,
  });
});
