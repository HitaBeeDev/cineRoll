import { Router } from "express";

import { getValidated, validate } from "../middleware/validate";
import {
  Archetype,
  Comparison,
  filmToVector,
  profileFromComparisons,
  rankArchetypes,
  TasteVector,
} from "./tasteTestRoute/model";
import { buildQuestions, buildTiebreaker } from "./tasteTestRoute/questions";
import { recommend } from "./tasteTestRoute/recommend";
import { getCandidatePool, getFilmsByIds } from "./tasteTestRoute/repository";
import { ResultBody, resultBodySchema } from "./tasteTestRoute/schemas";

export const tasteTestRouter = Router();

// GET /api/taste-test/questions — a varied run of comparable this-or-that rounds.
tasteTestRouter.get("/questions", async (_req, res) => {
  const pool = await getCandidatePool();
  res.json({ questions: buildQuestions(pool) });
});

/**
 * Resolve the answered pairs into a taste profile. Shared by the tiebreaker and
 * result routes: both take the (chosen, rejected) ids, look up the films, and
 * read each pick as a vote — so the model stays the single source of truth.
 */
async function profileFor(
  comparisons: ResultBody["comparisons"],
): Promise<{ profile: TasteVector; involvedIds: string[] }> {
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
  return { profile: profileFromComparisons(resolved), involvedIds };
}

// POST /api/taste-test/tiebreaker — given the picks so far, an optional finale
// pair that separates the top two archetypes (null when there's a clear winner).
tasteTestRouter.post("/tiebreaker", validate(resultBodySchema, "body"), async (req, res) => {
  const { comparisons } = getValidated<ResultBody>(req, "body");
  const { profile, involvedIds } = await profileFor(comparisons);
  const pool = await getCandidatePool();
  res.json({ question: buildTiebreaker(profile, pool, new Set(involvedIds)) });
});

// POST /api/taste-test/result — the answered pairs in, an archetype +
// recommendations out. Stateless: the client sends the (chosen, rejected) pair
// for each question and we recompute everything, so the model stays the single
// source of truth.
tasteTestRouter.post("/result", validate(resultBodySchema, "body"), async (req, res) => {
  const { comparisons } = getValidated<ResultBody>(req, "body");

  const { profile, involvedIds } = await profileFor(comparisons);
  // rankArchetypes always returns all six anchors, so both are defined.
  const [archetype, secondary] = rankArchetypes(profile) as [Archetype, Archetype];

  const pool = await getCandidatePool();
  const { hero, byType } = recommend(profile, pool, new Set(involvedIds));

  res.json({
    archetype: {
      key: archetype.key,
      label: archetype.label,
      emoji: archetype.emoji,
      blurb: archetype.blurb,
      accent: archetype.accent,
    },
    secondaryArchetype: { key: secondary.key, label: secondary.label, emoji: secondary.emoji },
    traits: archetype.tags,
    profile,
    hero,
    recommendations: byType,
  });
});
