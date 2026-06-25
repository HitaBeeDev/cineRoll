import { z } from "zod";

export const scoreBodySchema = z.object({
  seenFilmIds: z.array(z.string().trim().min(1)).max(100).default([]),
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
