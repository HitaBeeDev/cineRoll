import { z } from "zod";

export const slugParamsSchema = z.object({
  slug: z.string().trim().min(1).max(180),
});

export const peopleQuerySchema = z.object({
  query: z.string().trim().min(1).max(80),
  limit: z.coerce.number().int().min(1).max(12).default(8),
});

export type SlugParams = z.infer<typeof slugParamsSchema>;
export type PeopleQuery = z.infer<typeof peopleQuerySchema>;
