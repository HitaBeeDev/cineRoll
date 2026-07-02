import { z } from "zod";

export const scoreBodySchema = z.object({
  seenFilmIds: z.array(z.string().trim().min(1)).max(100).default([]),
  // The full administered ballot (all films shown), needed for the IRT score
  // (irt.ts). Optional for backward compatibility: when absent, the route falls
  // back to treating the seen set as the ballot.
  ballotFilmIds: z.array(z.string().trim().min(1)).max(100).default([]),
});

export const filmsQuerySchema = z.object({
  excludeFilmIds: z
    .preprocess(value => {
      if (Array.isArray(value)) return value.flatMap(item => String(item).split(","));
      if (typeof value === "string") return value.split(",");
      return [];
    }, z.array(z.string().trim().min(1)).max(80))
    .default([]),
});

export type ScoreBody = z.infer<typeof scoreBodySchema>;
export type FilmsQuery = z.infer<typeof filmsQuerySchema>;
