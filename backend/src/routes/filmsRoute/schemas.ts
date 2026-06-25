import { z } from "zod";

export const slugParamsSchema = z.object({
  slug: z.string().trim().min(1).max(180),
});

export const commentParamsSchema = slugParamsSchema.extend({
  id: z.string().trim().min(1),
});

export const commentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
});

export const commentBodySchema = z.object({
  body: z.string().trim().min(1).max(1000),
});

export const peopleQuerySchema = z.object({
  query: z.string().trim().min(1).max(80),
  limit: z.coerce.number().int().min(1).max(12).default(8),
});

export type SlugParams = z.infer<typeof slugParamsSchema>;
export type CommentParams = z.infer<typeof commentParamsSchema>;
export type CommentsQuery = z.infer<typeof commentsQuerySchema>;
export type CommentBody = z.infer<typeof commentBodySchema>;
export type PeopleQuery = z.infer<typeof peopleQuerySchema>;
