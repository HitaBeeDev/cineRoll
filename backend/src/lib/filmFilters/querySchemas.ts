import { z } from "zod";

import { AWARD_BODY_VALUES, AwardBodyValue } from "./constants";

const queryBooleanSchema = z.preprocess(value => {
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return value;
}, z.boolean());

// Like queryBooleanSchema but also accepts the "1"/"0" form used by the
// `?personalized=1` flag on the roll endpoint.
const queryFlagSchema = z.preprocess(value => {
  if (value === "1" || value === "true") return true;
  if (value === "0" || value === "false") return false;
  return value;
}, z.boolean());

// Multi-select facet param: a comma-separated list (`?genre=Drama,Comedy`) parsed
// into a string array. A single value parses to a 1-element array, so old
// single-value shared links and the natural-roll path keep working unchanged.
// `undefined` (param absent) short-circuits via `.optional()` before the effect runs.
const csvParam = (max: number) =>
  z
    .preprocess(
      value =>
        typeof value === "string"
          ? value.split(",").map(s => s.trim()).filter(Boolean)
          : value,
      z.array(z.string().min(1).max(max)),
    )
    .optional();

// Award bodies are a fixed enum; unknown tokens (and the legacy "all" sentinel)
// are dropped rather than rejected, mirroring the old default-to-all behavior.
const awardBodiesParam = z
  .preprocess(
    value =>
      typeof value === "string"
        ? value
            .split(",")
            .map(s => s.trim().toLowerCase())
            .filter((s): s is AwardBodyValue => (AWARD_BODY_VALUES as readonly string[]).includes(s))
        : value,
    z.array(z.enum(AWARD_BODY_VALUES)),
  )
  .optional();

const listQueryBaseSchema = z.object({
  search: z.string().trim().min(1).max(120).optional(),
  person: z.string().trim().min(1).max(120).optional(),
  director: z.string().trim().min(1).max(120).optional(),
  femaleDirectorOnly: queryBooleanSchema.optional(),
  awardBody: awardBodiesParam,
  contentType: csvParam(60),
  language: csvParam(10),
  genre: csvParam(80),
  country: csvParam(80),
  runtimeMax: z.coerce.number().int().min(1).max(1000).optional(),
  decadeMin: z.coerce.number().int().min(1800).max(2200).optional(),
  decadeMax: z.coerce.number().int().min(1800).max(2200).optional(),
  nominationCount: z.coerce.number().int().min(0).max(1000).optional(),
  awardYear: z.coerce.number().int().min(1800).max(2200).optional(),
  imdbRatingMin: z.coerce.number().min(0).max(10).optional(),
  imdbRatingMax: z.coerce.number().min(0).max(10).optional(),
  rtScoreMin: z.coerce.number().int().min(0).max(100).optional(),
  category: csvParam(120),
  winnerOnly: queryBooleanSchema.optional(),
  nominatedOnly: queryBooleanSchema.optional(),
  certificate: z.string().trim().min(1).max(20).optional(),
  imdbTopMoviesOnly: queryBooleanSchema.optional(),
  imdbTopTvOnly: queryBooleanSchema.optional(),
  tvType: z.string().trim().min(1).max(60).optional(),
  sort: z.enum(["newest", "title", "rating", "rt", "awards"]).default("newest"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  sample: z.enum(["onboarding"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

const validDecadeRange = (query: { decadeMin?: number | undefined; decadeMax?: number | undefined }) =>
  query.decadeMin === undefined ||
  query.decadeMax === undefined ||
  query.decadeMin <= query.decadeMax;

export const listQuerySchema = listQueryBaseSchema.refine(validDecadeRange, {
  message: "decadeMin must be less than or equal to decadeMax",
  path: ["decadeMin"],
});

export const randomQuerySchema = listQueryBaseSchema.extend({
  userId: z.string().trim().min(1).max(180).optional(),
  // Opt-in taste-weighted roll (signed-in only). Ignored without a userId.
  personalized: queryFlagSchema.optional(),
  // Client-supplied film IDs to exclude from the roll, e.g. a guest's
  // session-hidden films. Comma-separated; capped so the IN-list stays bounded.
  // `.optional()` sits outside the preprocess (like `personalized` above) so a
  // missing key short-circuits to undefined instead of running the effect.
  excludeIds: z
    .preprocess(
      value =>
        typeof value === "string"
          ? value.split(",").map(id => id.trim()).filter(Boolean)
          : value,
      z.array(z.string().min(1).max(180)).max(100),
    )
    .optional(),
}).refine(validDecadeRange, {
  message: "decadeMin must be less than or equal to decadeMax",
  path: ["decadeMin"],
});

export type ListQuery = z.infer<typeof listQuerySchema>;
export type RandomQuery = z.infer<typeof randomQuerySchema>;
