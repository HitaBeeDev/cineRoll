import { prisma } from "./prisma";

/**
 * Allowed filter values, derived from the DB so the set the model is checked
 * against can never drift from the actual data. The natural-language roll
 * validates Gemini's extracted filters against these before querying — the
 * model may interpret, but only values that really exist in the catalog survive.
 */
export type AllowedFilterValues = {
  genres: Set<string>;
  languages: Set<string>;
  contentTypes: Set<string>;
  categories: Set<string>;
  awardBodies: Set<string>;
  yearMin: number;
  yearMax: number;
};

/** Award bodies are a fixed, code-level enum (mirrors filmFilters' awardBody). */
const AWARD_BODIES = ["oscar", "goldenglobe", "cannes", "berlin", "all"] as const;

/** Cache the lists for an hour — they only change on a data rebuild/seed. */
const TTL_MS = 60 * 60 * 1000;

type CacheEntry = { value: AllowedFilterValues; builtAt: number };
let cache: CacheEntry | null = null;
let inFlight: Promise<AllowedFilterValues> | null = null;

async function build(): Promise<AllowedFilterValues> {
  const [genreRows, languageRows, contentTypeRows, categoryRows, yearRows] =
    await Promise.all([
      prisma.$queryRaw<{ value: string }[]>`
        SELECT DISTINCT UNNEST("genres") AS value FROM "Film"
      `,
      prisma.$queryRaw<{ value: string }[]>`
        SELECT DISTINCT "language" AS value FROM "Film" WHERE "language" IS NOT NULL
      `,
      prisma.$queryRaw<{ value: string }[]>`
        SELECT DISTINCT UNNEST("types") AS value FROM "Film"
      `,
      // Award categories live inside the four *Categories JSON arrays.
      prisma.$queryRaw<{ value: string }[]>`
        SELECT DISTINCT award->>'category' AS value
        FROM "Film",
          LATERAL jsonb_array_elements(
            "oscarCategories" || "ggCategories" || "cannesCategories" || "berlinCategories"
          ) AS award
        WHERE award->>'category' IS NOT NULL
      `,
      prisma.$queryRaw<{ min: number | null; max: number | null }[]>`
        SELECT MIN("year")::INT AS min, MAX("year")::INT AS max FROM "Film"
      `,
    ]);

  const toSet = (rows: { value: string }[]) =>
    new Set(rows.map(r => r.value).filter((v): v is string => Boolean(v)));

  return {
    genres: toSet(genreRows),
    languages: toSet(languageRows),
    contentTypes: toSet(contentTypeRows),
    categories: toSet(categoryRows),
    awardBodies: new Set<string>(AWARD_BODIES),
    yearMin: yearRows[0]?.min ?? 1888,
    yearMax: yearRows[0]?.max ?? new Date().getFullYear(),
  };
}

/**
 * The cached allowed-value lists, rebuilt lazily once stale. Concurrent callers
 * during a (re)build share the same in-flight promise so we never run the
 * distinct queries more than once at a time.
 */
export async function getAllowedFilterValues(): Promise<AllowedFilterValues> {
  if (cache && Date.now() - cache.builtAt < TTL_MS) return cache.value;
  if (inFlight) return inFlight;

  inFlight = build()
    .then(value => {
      cache = { value, builtAt: Date.now() };
      return value;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

/** Drop the cache (e.g. after a data reseed). */
export function invalidateAllowedFilterValues(): void {
  cache = null;
}
