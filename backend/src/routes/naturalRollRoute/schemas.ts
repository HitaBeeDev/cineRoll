import { z } from "zod";

export const naturalRollBodySchema = z.object({
  prompt: z.string().trim().min(1).max(500),
  userId: z.string().trim().min(1).max(180).optional(),
  count: z.number().int().min(1).max(6).optional(),
}).strict();

const nullableString = z.union([z.string().trim().min(1), z.null()]);
const nullableBoolean = z.union([z.boolean(), z.null()]);
const nullableNumber = z.union([z.number(), z.null()]);
// Gemini sometimes emits a single string where an array was asked for; accept both.
const nullableStringList = z.union([
  z.array(z.string().trim().min(1)),
  z.string().trim().min(1).transform(value => [value]),
  z.null(),
]);

export const stage1Schema = z.object({
  language: nullableString.optional(),
  // What the film must BE ("a romance", "romantic drama") — becomes the SQL
  // genre filter. vs. genre-ish qualities ("with music") — ranking-only.
  requiredGenres: nullableStringList.optional(),
  preferredGenres: nullableStringList.optional(),
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
  // Soft preferences — scored, never turned into SQL filters (see softPreferences.ts).
  tones: nullableStringList.optional(),
  themes: nullableStringList.optional(),
  keywords: nullableStringList.optional(),
  // How many picks the user explicitly asked for ("suggest only one movie").
  resultCount: nullableNumber.optional(),
}).strict();

export const rerankOutputSchema = z.object({ picks: z.array(z.string()) });

export type NaturalRollBody = z.infer<typeof naturalRollBodySchema>;
export type Stage1Filters = z.infer<typeof stage1Schema>;
