import { z } from "zod";

export const naturalRollBodySchema = z.object({
  prompt: z.string().trim().min(1).max(500),
  userId: z.string().trim().min(1).max(180).optional(),
  count: z.number().int().min(1).max(6).optional(),
}).strict();

const nullableString = z.union([z.string().trim().min(1), z.null()]);
const nullableBoolean = z.union([z.boolean(), z.null()]);
const nullableNumber = z.union([z.number(), z.null()]);

export const stage1Schema = z.object({
  language: nullableString.optional(),
  genre: nullableString.optional(),
  contentType: nullableString.optional(),
  awardBody: z.union([z.enum(["oscar", "goldenglobe", "cannes", "all"]), z.null()]).optional(),
  winnerOnly: nullableBoolean.optional(),
  nominatedOnly: nullableBoolean.optional(),
  decadeMin: nullableNumber.optional(),
  decadeMax: nullableNumber.optional(),
  director: nullableString.optional(),
  person: nullableString.optional(),
  awardYear: nullableNumber.optional(),
  category: nullableString.optional(),
  femaleDirectorOnly: nullableBoolean.optional(),
}).strict();

export const rerankOutputSchema = z.object({ picks: z.array(z.string()) });

export type NaturalRollBody = z.infer<typeof naturalRollBodySchema>;
export type Stage1Filters = z.infer<typeof stage1Schema>;
