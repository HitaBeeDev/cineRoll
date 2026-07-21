import { z } from "zod";

const PAGE_LIMIT_DEFAULT = 20;

export const filmIdBodySchema = z.object({
  filmId: z.string().trim().min(1),
});

export const watchedBodySchema = filmIdBodySchema.extend({
  doNotSuggest: z.boolean().default(false),
  sentiment: z.enum(["like", "dislike"]).nullable().optional(),
});

export const filmIdParamsSchema = z.object({
  filmId: z.string().trim().min(1),
});

// Custom lists — a name is 1–50 chars after trimming (the ≤50 cap from the
// product spec); enforced here so both create and rename share one rule.
export const listNameBodySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50, "Name must be 50 characters or fewer"),
});

export const listIdParamsSchema = z.object({
  listId: z.string().trim().min(1),
});

export const listFilmParamsSchema = z.object({
  listId: z.string().trim().min(1),
  filmId: z.string().trim().min(1),
});

// The film-membership query on GET /lists: when present, each returned list is
// flagged with whether it already contains this film (drives the save popover).
export const listsQuerySchema = z.object({
  filmId: z.string().trim().min(1).optional(),
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
export type FilmIdParams = z.infer<typeof filmIdParamsSchema>;
export type OnboardingBody = z.infer<typeof onboardingBodySchema>;
export type CursorQuery = z.infer<typeof cursorQuerySchema>;
export type ListNameBody = z.infer<typeof listNameBodySchema>;
export type ListIdParams = z.infer<typeof listIdParamsSchema>;
export type ListFilmParams = z.infer<typeof listFilmParamsSchema>;
export type ListsQuery = z.infer<typeof listsQuerySchema>;
