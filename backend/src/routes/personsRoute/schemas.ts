import { z } from "zod";

export const autocompleteSchema = z.object({
  q: z.string().trim().min(1).max(80),
  limit: z.coerce.number().int().min(1).max(12).default(8),
});

export const personParamsSchema = z.object({
  slug: z.string().trim().min(1).max(180),
});

export type AutocompleteQuery = z.infer<typeof autocompleteSchema>;
export type PersonParams = z.infer<typeof personParamsSchema>;
