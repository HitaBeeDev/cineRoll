import { z } from "zod";

const PAGE_LIMIT_DEFAULT = 20;

export const filmIdBodySchema = z.object({
  filmId: z.string().trim().min(1),
});

export const watchedBodySchema = filmIdBodySchema.extend({
  doNotSuggest: z.boolean().default(false),
  sentiment: z.enum(["like", "dislike"]).nullable().optional(),
});

export const ratingBodySchema = filmIdBodySchema.extend({
  rating: z.number()
    .min(1)
    .max(10)
    .refine(value => Number.isInteger(value * 2), "Rating must be a multiple of 0.5"),
});

export const filmIdParamsSchema = z.object({
  filmId: z.string().trim().min(1),
});

export const onboardingBodySchema = z.object({
  genres: z.array(z.string().trim().min(1)).max(30),
});

export const cursorQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(PAGE_LIMIT_DEFAULT),
  cursor: z.string().trim().min(1).optional(),
});

export type FilmIdBody = z.infer<typeof filmIdBodySchema>;
export type WatchedBody = z.infer<typeof watchedBodySchema>;
export type RatingBody = z.infer<typeof ratingBodySchema>;
export type FilmIdParams = z.infer<typeof filmIdParamsSchema>;
export type OnboardingBody = z.infer<typeof onboardingBodySchema>;
export type CursorQuery = z.infer<typeof cursorQuerySchema>;
