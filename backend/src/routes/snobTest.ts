import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { getValidated, validate } from "../middleware/validate";

export const snobTestRouter = Router();

type AwardBody = "oscar" | "goldenglobe" | "cannes";

type SnobTestFilmRow = {
  id: string;
  slug: string;
  title: string;
  originalTitle: string | null;
  releaseYear: number;
  year: number;
  genres: string[];
  posterUrl: string | null;
  posterColor: string | null;
  imdbRating: number | null;
  imdbTopMovieRank: number | null;
  imdbTopTvRank: number | null;
  decade: number;
  awardBodies: AwardBody[];
  oscarNominations: number;
  oscarWins: number;
  ggNominations: number;
  ggWins: number;
  cannesNominations: number;
  cannesWins: number;
};

type ScoreFilmRow = {
  id: string;
  releaseYear: number;
  decade: number;
  awardBodies: AwardBody[];
};

type BreakdownBucket = {
  seen: number;
  total: number;
};

const scoreBodySchema = z.object({
  seenFilmIds: z.array(z.string().trim().min(1)).max(100).default([]),
});

const filmsQuerySchema = z.object({
  excludeFilmIds: z
    .preprocess((value) => {
      if (Array.isArray(value)) return value.flatMap(item => String(item).split(","));
      if (typeof value === "string") return value.split(",");
      return [];
    }, z.array(z.string().trim().min(1)).max(80))
    .default([]),
});

const SNOB_TEST_FILM_COUNT = 20;

const snobTestFilmSelect = Prisma.sql`
  "Film"."id",
  "Film"."slug",
  "Film"."title",
  "Film"."originalTitle",
  "Film"."year" AS "releaseYear",
  "Film"."year",
  "Film"."genres",
  "Film"."posterUrl",
  "Film"."posterColor",
  "Film"."imdbRating",
  "Film"."imdbTopMovieRank",
  "Film"."imdbTopTvRank",
  "Film"."oscarNominations",
  "Film"."oscarWins",
  "Film"."ggNominations",
  "Film"."ggWins",
  "Film"."cannesNominations",
  "Film"."cannesWins",
  (FLOOR("Film"."year" / 10) * 10)::INT AS "decade",
  ARRAY_REMOVE(ARRAY[
    CASE WHEN ("Film"."oscarNominations" + "Film"."oscarWins") > 0 THEN 'oscar' END,
    CASE WHEN ("Film"."ggNominations" + "Film"."ggWins") > 0 THEN 'goldenglobe' END,
    CASE WHEN ("Film"."cannesNominations" + "Film"."cannesWins") > 0 THEN 'cannes' END
  ], NULL)::TEXT[] AS "awardBodies"
`;

const scoreFilmSelect = Prisma.sql`
  "Film"."id",
  "Film"."year" AS "releaseYear",
  (FLOOR("Film"."year" / 10) * 10)::INT AS "decade",
  ARRAY_REMOVE(ARRAY[
    CASE WHEN ("Film"."oscarNominations" + "Film"."oscarWins") > 0 THEN 'oscar' END,
    CASE WHEN ("Film"."ggNominations" + "Film"."ggWins") > 0 THEN 'goldenglobe' END,
    CASE WHEN ("Film"."cannesNominations" + "Film"."cannesWins") > 0 THEN 'cannes' END
  ], NULL)::TEXT[] AS "awardBodies"
`;

function titleForScore(score: number) {
  if (score <= 10) return "Certified Normie";
  if (score <= 25) return "Casual Watcher";
  if (score <= 45) return "Film Enthusiast";
  if (score <= 65) return "Award Season Regular";
  if (score <= 80) return "Serious Cinephile";
  if (score <= 95) return "Film School Graduate";
  return "The Snob";
}

function createBreakdownBucket(): BreakdownBucket {
  return { seen: 0, total: 0 };
}

snobTestRouter.get("/films", validate(filmsQuerySchema), async (req, res) => {
  const { excludeFilmIds } = getValidated<z.infer<typeof filmsQuerySchema>>(req, "query");
  const uniqueExcludeFilmIds = [...new Set(excludeFilmIds)];
  const excludeSql =
    uniqueExcludeFilmIds.length > 0
      ? Prisma.sql`AND "Film"."id" NOT IN (${Prisma.join(uniqueExcludeFilmIds)})`
      : Prisma.empty;

  const films = await prisma.$queryRaw<SnobTestFilmRow[]>`
    WITH candidates AS (
      SELECT
        ${snobTestFilmSelect},
        COALESCE(("Film"."genres")[1], 'Other') AS "primaryGenre",
        TRIM(BOTH FROM REGEXP_REPLACE(
          REGEXP_REPLACE(
            REGEXP_REPLACE(LOWER("Film"."title"), '^(the|a|an)\s+', ''),
            '[:].*$',
            ''
          ),
          '[[:space:]]+(part|chapter|episode)[[:space:]]+[ivxlcdm0-9]+$',
          ''
        )
        ) AS "titleRoot",
        CASE
          WHEN ("Film"."oscarNominations" + ("Film"."oscarWins" * 2)) >= GREATEST(
            "Film"."ggNominations" + ("Film"."ggWins" * 2),
            "Film"."cannesNominations" + ("Film"."cannesWins" * 2)
          ) THEN 'oscar'
          WHEN ("Film"."ggNominations" + ("Film"."ggWins" * 2)) >= ("Film"."cannesNominations" + ("Film"."cannesWins" * 2)) THEN 'goldenglobe'
          ELSE 'cannes'
        END AS "primaryAwardBody",
        (
          COALESCE("Film"."imdbRating", 0) * 9
          + CASE WHEN "Film"."imdbTopMovieRank" IS NOT NULL THEN ((260 - "Film"."imdbTopMovieRank") * 0.55) ELSE 0 END
          + CASE WHEN "Film"."imdbTopTvRank" IS NOT NULL THEN ((260 - "Film"."imdbTopTvRank") * 0.55) ELSE 0 END
          + ("Film"."oscarWins" * 10)
          + ("Film"."ggWins" * 7)
          + ("Film"."cannesWins" * 8)
          + (("Film"."oscarNominations" + "Film"."ggNominations" + "Film"."cannesNominations") * 1.5)
          + CASE WHEN "Film"."posterUrl" IS NOT NULL THEN 8 ELSE 0 END
        ) AS "knownScore"
      FROM "Film"
      WHERE ("Film"."oscarNominations" + "Film"."oscarWins" + "Film"."ggNominations" + "Film"."ggWins" + "Film"."cannesNominations" + "Film"."cannesWins") > 0
        ${excludeSql}
    ),
    ranked AS (
      SELECT
        candidates.*,
        ROW_NUMBER() OVER (PARTITION BY "decade" ORDER BY "knownScore" + (RANDOM() * 70) DESC) AS "decadeRank",
        ROW_NUMBER() OVER (PARTITION BY "primaryGenre" ORDER BY "knownScore" + (RANDOM() * 70) DESC) AS "genreRank",
        ROW_NUMBER() OVER (PARTITION BY "primaryAwardBody" ORDER BY "knownScore" + (RANDOM() * 70) DESC) AS "awardBodyRank",
        ROW_NUMBER() OVER (PARTITION BY "titleRoot" ORDER BY "knownScore" + (RANDOM() * 70) DESC) AS "titleRootRank"
      FROM candidates
    ),
    spread_pool AS (
      SELECT *
      FROM ranked
      WHERE ("decadeRank" <= 3 OR "genreRank" <= 2 OR "awardBodyRank" <= 8)
        AND "titleRootRank" = 1
    ),
    sampled AS (
      SELECT *
      FROM spread_pool
      ORDER BY "knownScore" + (RANDOM() * 140) DESC
      LIMIT 20
    )
    SELECT
      "id",
      "slug",
      "title",
      "originalTitle",
      "releaseYear",
      "year",
      "genres",
      "posterUrl",
      "posterColor",
      "imdbRating",
      "imdbTopMovieRank",
      "imdbTopTvRank",
      "decade",
      "awardBodies",
      "oscarNominations",
      "oscarWins",
      "ggNominations",
      "ggWins",
      "cannesNominations",
      "cannesWins"
    FROM sampled
    ORDER BY RANDOM()
  `;

  res.json({ films });
});

snobTestRouter.post("/score", validate(scoreBodySchema, "body"), async (req, res) => {
  const { seenFilmIds } = getValidated<z.infer<typeof scoreBodySchema>>(req, "body");
  const uniqueSeenFilmIds = [...new Set(seenFilmIds)];

  const films =
    uniqueSeenFilmIds.length === 0
      ? []
      : await prisma.$queryRaw<ScoreFilmRow[]>`
          SELECT ${scoreFilmSelect}
          FROM "Film"
          WHERE "Film"."id" IN (${Prisma.join(uniqueSeenFilmIds)})
        `;

  const validSeenIds = new Set(films.map(film => film.id));
  const total: number = SNOB_TEST_FILM_COUNT;
  const seen = Math.min(validSeenIds.size, total);
  const score = total === 0 ? 0 : Math.round((seen / total) * 100);
  const byDecade: Record<string, BreakdownBucket> = {};
  const byAwardBody: Record<AwardBody, BreakdownBucket> = {
    oscar: createBreakdownBucket(),
    goldenglobe: createBreakdownBucket(),
    cannes: createBreakdownBucket(),
  };

  for (const film of films) {
    const decadeKey = `${film.decade}s`;
    byDecade[decadeKey] ??= createBreakdownBucket();
    byDecade[decadeKey].total += 1;
    byDecade[decadeKey].seen += 1;

    for (const awardBody of film.awardBodies) {
      byAwardBody[awardBody].total += 1;
      byAwardBody[awardBody].seen += 1;
    }
  }

  res.json({
    score,
    title: titleForScore(score),
    seen,
    total,
    breakdown: {
      byDecade,
      byAwardBody,
    },
  });
});
