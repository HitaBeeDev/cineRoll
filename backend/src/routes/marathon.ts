import { Router } from "express";
import { z } from "zod";
import { RandomQuery, randomQuerySchema } from "../lib/filmFilters/randomQuerySchema";
import { setPublicCache } from "../lib/cache";
import { getRandomFilms } from "./random";
import { getValidated, validate } from "../middleware/validate";

export const marathonRouter = Router();

const marathonQuerySchema = randomQuerySchema.extend({
  count: z.coerce.number().int().min(1).max(5).default(3),
});

type MarathonQuery = z.infer<typeof marathonQuerySchema>;

marathonRouter.get("/", validate(marathonQuerySchema), async (req, res) => {
  const { count, ...filmQuery } = getValidated<MarathonQuery>(req, "query");

  const { films, total } = await getRandomFilms(filmQuery as RandomQuery, count);

  const totalRuntime = films.reduce((sum, f) => sum + (f.runtime ?? 0), 0);

  setPublicCache(res, 60);
  res.json({ films, totalRuntime, total });
});
