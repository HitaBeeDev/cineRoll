import { Prisma } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { cache, cacheKeys, setPublicCache } from "../lib/cache";
import { buildWhereClause } from "../lib/filmFilters/whereClause";
import { ListQuery, listQuerySchema } from "../lib/filmFilters/listQuerySchema";
import { prisma } from "../lib/prisma";
import { AuthedRequest, OptionallyAuthedRequest, optionalAuth, requireAuth } from "../middleware/auth";
import { HttpError } from "../middleware/errorHandler";
import { getValidated, validate } from "../middleware/validate";

export const filmsRouter = Router();

/** Film records are immutable between reseeds, so a long TTL is safe. */
const FILM_DETAIL_TTL_MS = 60 * 60 * 1000;

const filmListSelect = Prisma.sql`
  "Film"."id",
  "Film"."slug",
  "Film"."title",
  "Film"."originalTitle",
  "Film"."year" AS "releaseYear",
  "Film"."year",
  "Film"."genres",
  "Film"."contentType",
  "Film"."posterUrl",
  "Film"."posterColor",
  "Film"."imdbRating",
  "Film"."rtScore",
  "Film"."imdbTopMovieRank",
  "Film"."imdbTopTvRank",
  "Film"."certificate",
  "Film"."tvType",
  "Film"."tvStartYear",
  "Film"."tvEndYear",
  "Film"."oscarNominations",
  "Film"."oscarWins",
  "Film"."ggNominations",
  "Film"."ggWins",
  "Film"."cannesNominations",
  "Film"."cannesWins",
  "Film"."berlinNominations",
  "Film"."berlinWins",
  (
    SELECT ROUND(AVG("UserRating"."rating")::numeric, 1)::double precision
    FROM "UserRating"
    WHERE "UserRating"."filmId" = "Film"."id"
  ) AS "averageRating",
  (
    SELECT COUNT(*)::int
    FROM "UserRating"
    WHERE "UserRating"."filmId" = "Film"."id"
  ) AS "ratingCount"
`;

const filmDetailSelect = {
  id: true,
  slug: true,
  tmdbId: true,
  imdbId: true,
  title: true,
  originalTitle: true,
  releaseYear: true,
  runtime: true,
  genres: true,
  contentType: true,
  plot: true,
  director: true,
  cast: true,
  language: true,
  posterUrl: true,
  posterColor: true,
  backdropUrl: true,
  trailerUrl: true,
  imdbRating: true,
  rtScore: true,
  imdbTopMovieRank: true,
  imdbTopTvRank: true,
  certificate: true,
  tvType: true,
  tvStartYear: true,
  tvEndYear: true,
  oscarNominations: true,
  oscarWins: true,
  oscarCategories: true,
  ggNominations: true,
  ggWins: true,
  ggCategories: true,
  cannesNominations: true,
  cannesWins: true,
  cannesCategories: true,
  berlinNominations: true,
  berlinWins: true,
  berlinCategories: true,
  watchProviders: true,
  isPickOfDay: true,
  pickOfDayDate: true,
};

const slugParamsSchema = z.object({
  slug: z.string().trim().min(1).max(180),
});

const commentParamsSchema = slugParamsSchema.extend({
  id: z.string().trim().min(1),
});

const commentsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
});

const commentBodySchema = z.object({
  body: z.string().trim().min(1).max(1000),
});

const peopleQuerySchema = z.object({
  query: z.string().trim().min(1).max(80),
  limit: z.coerce.number().int().min(1).max(12).default(8),
});

const COMMENTS_PAGE_SIZE = 20;

function filmListOrderBy(sort: ListQuery["sort"], sortOrder: ListQuery["sortOrder"]) {
  const dir = sortOrder === "asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`;
  const dirOpp = sortOrder === "asc" ? Prisma.sql`DESC` : Prisma.sql`ASC`;

  if (sort === "title") {
    return Prisma.sql`"Film"."title" ${dir}, "Film"."year" ${dirOpp}`;
  }

  if (sort === "rating") {
    return Prisma.sql`"Film"."imdbRating" ${dir} NULLS LAST, "Film"."year" ${dirOpp}, "Film"."title" ASC`;
  }

  if (sort === "rt") {
    return Prisma.sql`"Film"."rtScore" ${dir} NULLS LAST, "Film"."year" ${dirOpp}, "Film"."title" ASC`;
  }

  if (sort === "awards") {
    return Prisma.sql`
      (
        "Film"."oscarWins"
        + "Film"."ggWins"
        + "Film"."cannesWins"
        + "Film"."berlinWins"
      ) ${dir},
      (
        "Film"."oscarNominations"
        + "Film"."ggNominations"
        + "Film"."cannesNominations"
        + "Film"."berlinNominations"
      ) ${dir},
      "Film"."title" ASC
    `;
  }

  return Prisma.sql`"Film"."year" ${dir}, "Film"."title" ASC`;
}

filmsRouter.get("/certificates", async (_req, res) => {
  const rows = await prisma.$queryRaw<{ certificate: string }[]>`
    SELECT DISTINCT "Film"."certificate"
    FROM "Film"
    WHERE "Film"."certificate" IS NOT NULL AND "Film"."certificate" <> ''
    ORDER BY "Film"."certificate" ASC
  `;

  setPublicCache(res, 3600);
  res.json({ certificates: rows.map(r => r.certificate) });
});

filmsRouter.get("/languages", async (_req, res) => {
  const rows = await prisma.$queryRaw<{ language: string }[]>`
    SELECT DISTINCT "Film"."language"
    FROM "Film"
    WHERE "Film"."language" IS NOT NULL AND "Film"."language" <> ''
    ORDER BY "Film"."language" ASC
  `;

  setPublicCache(res, 3600);
  res.json({ languages: rows.map(r => r.language) });
});

filmsRouter.get("/tv-types", async (_req, res) => {
  const rows = await prisma.$queryRaw<{ tvType: string }[]>`
    SELECT DISTINCT "Film"."tvType"
    FROM "Film"
    WHERE "Film"."tvType" IS NOT NULL AND "Film"."tvType" <> ''
    ORDER BY "Film"."tvType" ASC
  `;

  setPublicCache(res, 3600);
  res.json({ tvTypes: rows.map(r => r.tvType) });
});

filmsRouter.get("/genres", async (_req, res) => {
  const rows = await prisma.$queryRaw<{ genre: string }[]>`
    SELECT DISTINCT unnest("Film"."genres") AS genre
    FROM "Film"
    WHERE array_length("Film"."genres", 1) > 0
    ORDER BY genre ASC
  `;

  setPublicCache(res, 3600);
  res.json({ genres: rows.map(r => r.genre) });
});

filmsRouter.get("/countries", async (_req, res) => {
  const rows = await prisma.$queryRaw<{ country: string }[]>`
    SELECT DISTINCT unnest("Film"."countries") AS country
    FROM "Film"
    WHERE array_length("Film"."countries", 1) > 0
    ORDER BY country ASC
  `;

  setPublicCache(res, 3600);
  res.json({ countries: rows.map(r => r.country) });
});

filmsRouter.get("/award-years", async (_req, res) => {
  const rows = await prisma.$queryRaw<{ awardYear: number }[]>`
    SELECT DISTINCT (award->>'awardYear')::INT AS "awardYear"
    FROM "Film", jsonb_array_elements("Film"."oscarCategories") AS award
    WHERE award->>'awardYear' IS NOT NULL
    UNION
    SELECT DISTINCT (award->>'awardYear')::INT AS "awardYear"
    FROM "Film", jsonb_array_elements("Film"."ggCategories") AS award
    WHERE award->>'awardYear' IS NOT NULL
    UNION
    SELECT DISTINCT (award->>'awardYear')::INT AS "awardYear"
    FROM "Film", jsonb_array_elements("Film"."cannesCategories") AS award
    WHERE award->>'awardYear' IS NOT NULL
    ORDER BY "awardYear" ASC
  `;

  setPublicCache(res, 3600);
  res.json({ awardYears: rows.map(r => r.awardYear) });
});

filmsRouter.get("/categories", async (_req, res) => {
  const rows = await prisma.$queryRaw<{ category: string }[]>`
    SELECT DISTINCT award->>'category' AS category
    FROM "Film", jsonb_array_elements("Film"."oscarCategories") AS award
    WHERE award->>'category' IS NOT NULL
    UNION
    SELECT DISTINCT award->>'category' AS category
    FROM "Film", jsonb_array_elements("Film"."ggCategories") AS award
    WHERE award->>'category' IS NOT NULL
    UNION
    SELECT DISTINCT award->>'category' AS category
    FROM "Film", jsonb_array_elements("Film"."cannesCategories") AS award
    WHERE award->>'category' IS NOT NULL
    ORDER BY category ASC
  `;

  setPublicCache(res, 3600);
  res.json({ categories: rows.map(r => r.category) });
});

filmsRouter.get("/people", validate(peopleQuerySchema), async (req, res) => {
  const { query, limit } = getValidated<z.infer<typeof peopleQuerySchema>>(req, "query");
  const queryLike = `%${query}%`;
  const queryPrefix = `${query}%`;
  const rows = await prisma.$queryRaw<{ name: string; roles: string[]; count: bigint }[]>`
    WITH names AS (
      SELECT "Film"."director" AS name, 'Director' AS role
      FROM "Film"
      WHERE "Film"."director" IS NOT NULL AND "Film"."director" <> ''

      UNION ALL

      SELECT "castName" AS name, 'Cast' AS role
      FROM "Film", jsonb_array_elements_text("Film"."cast") AS "castName"
      WHERE "castName" IS NOT NULL AND "castName" <> ''

      UNION ALL

      SELECT award->>'nominee' AS name, 'Award nominee' AS role
      FROM "Film", jsonb_array_elements("Film"."oscarCategories") AS award
      WHERE award->>'nominee' IS NOT NULL AND award->>'nominee' <> ''

      UNION ALL

      SELECT award->>'nominee' AS name, 'Award nominee' AS role
      FROM "Film", jsonb_array_elements("Film"."ggCategories") AS award
      WHERE award->>'nominee' IS NOT NULL AND award->>'nominee' <> ''

      UNION ALL

      SELECT award->>'nominee' AS name, 'Award nominee' AS role
      FROM "Film", jsonb_array_elements("Film"."cannesCategories") AS award
      WHERE award->>'nominee' IS NOT NULL AND award->>'nominee' <> ''
    )
    SELECT
      name,
      ARRAY_AGG(DISTINCT role ORDER BY role) AS roles,
      COUNT(*)::BIGINT AS count
    FROM names
    WHERE name ILIKE ${queryLike}
    GROUP BY name
    ORDER BY
      CASE WHEN name ILIKE ${queryPrefix} THEN 0 ELSE 1 END,
      count DESC,
      name ASC
    LIMIT ${limit}
  `;

  setPublicCache(res, 300);
  res.json({
    people: rows.map(row => ({
      name: row.name,
      roles: row.roles,
      count: Number(row.count),
    })),
  });
});

filmsRouter.get("/", validate(listQuerySchema), async (req, res) => {
  const query = getValidated<ListQuery>(req, "query");
  const sampleConditions =
    query.sample === "onboarding"
      ? [
          Prisma.sql`"Film"."contentType" = 'movie'`,
          Prisma.sql`"Film"."posterUrl" IS NOT NULL`,
          Prisma.sql`"Film"."imdbRating" IS NOT NULL`,
        ]
      : [];
  const whereSql = buildWhereClause(query, sampleConditions);
  const offset = (query.page - 1) * query.limit;

  if (query.sample === "onboarding") {
    const [films, countRows] = await Promise.all([
      prisma.$queryRaw`
        WITH candidates AS (
          SELECT
            ${filmListSelect},
            (FLOOR("Film"."year" / 10) * 10)::INT AS "decade",
            COALESCE(("Film"."genres")[1], 'Other') AS "primaryGenre"
          FROM "Film"
          ${whereSql}
        ),
        ranked AS (
          SELECT
            candidates.*,
            ROW_NUMBER() OVER (PARTITION BY "decade" ORDER BY RANDOM()) AS "decadeRank",
            ROW_NUMBER() OVER (PARTITION BY "primaryGenre" ORDER BY RANDOM()) AS "genreRank"
          FROM candidates
        ),
        spread_pool AS (
          SELECT *
          FROM ranked
          WHERE "decadeRank" <= 2 OR "genreRank" <= 2
        ),
        sampled AS (
          SELECT *
          FROM spread_pool
          ORDER BY RANDOM()
          LIMIT ${query.limit}
        )
        SELECT
          "id",
          "slug",
          "title",
          "originalTitle",
          "releaseYear",
          "year",
          "genres",
          "contentType",
          "posterUrl",
          "posterColor",
          "imdbRating",
          "rtScore",
          "imdbTopMovieRank",
          "imdbTopTvRank",
          "certificate",
          "tvType",
          "tvStartYear",
          "tvEndYear",
          "oscarNominations",
          "oscarWins",
          "ggNominations",
          "ggWins",
          "cannesNominations",
          "cannesWins",
          "berlinNominations",
          "berlinWins",
          "averageRating",
          "ratingCount"
        FROM sampled
        ORDER BY RANDOM()
      `,
      prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(*)::BIGINT AS count
        FROM "Film"
        ${whereSql}
      `,
    ]);

    const total = Number(countRows[0]?.count ?? 0);

    res.json({
      films,
      total,
      page: 1,
      totalPages: Math.ceil(total / query.limit),
      pageSize: query.limit,
    });
    return;
  }

  const [films, countRows] = await Promise.all([
    prisma.$queryRaw`
      SELECT ${filmListSelect}
      FROM "Film"
      ${whereSql}
      ORDER BY ${filmListOrderBy(query.sort, query.sortOrder)}
      LIMIT ${query.limit}
      OFFSET ${offset}
    `,
    prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::BIGINT AS count
      FROM "Film"
      ${whereSql}
    `,
  ]);

  const total = Number(countRows[0]?.count ?? 0);

  setPublicCache(res, 300);
  res.json({
    films,
    total,
    page: query.page,
    totalPages: Math.ceil(total / query.limit),
    pageSize: query.limit,
  });
});

filmsRouter.get("/:slug/similar", validate(slugParamsSchema, "params"), async (req, res) => {
  const { slug } = getValidated<z.infer<typeof slugParamsSchema>>(req, "params");

  const film = await prisma.film.findUnique({
    where: { slug },
    select: {
      id: true,
      director: true,
      genres: true,
      oscarCategories: true,
      ggCategories: true,
      cannesCategories: true,
    },
  });

  if (!film) throw new HttpError(404, "Film not found", "FILM_NOT_FOUND");

  type AwardRec = { awardYear: number };
  const allAwards = [
    ...((film.oscarCategories as AwardRec[]) ?? []),
    ...((film.ggCategories as AwardRec[]) ?? []),
    ...((film.cannesCategories as AwardRec[]) ?? []),
  ];
  const ceremonyYears = [...new Set(allAwards.map(r => r.awardYear))];

  const orParts: Prisma.Sql[] = [];
  const scoreParts: Prisma.Sql[] = [];

  if (film.director) {
    orParts.push(Prisma.sql`"Film"."director" = ${film.director}`);
    scoreParts.push(Prisma.sql`CASE WHEN "Film"."director" = ${film.director} THEN 1 ELSE 0 END`);
  }

  if (film.genres.length > 0) {
    const mkGenreArr = () => Prisma.join(film.genres.map(g => Prisma.sql`${g}`), ",");
    orParts.push(Prisma.sql`"Film"."genres" && ARRAY[${mkGenreArr()}]::text[]`);
    scoreParts.push(Prisma.sql`CASE WHEN "Film"."genres" && ARRAY[${mkGenreArr()}]::text[] THEN 1 ELSE 0 END`);
  }

  if (ceremonyYears.length > 0) {
    const mkYearArr = () => Prisma.join(ceremonyYears.map(y => Prisma.sql`${y}`), ",");
    const mkYearCheck = () => Prisma.sql`(
      EXISTS (SELECT 1 FROM jsonb_array_elements("Film"."oscarCategories") AS a WHERE (a->>'awardYear')::int = ANY(ARRAY[${mkYearArr()}]::int[]))
      OR EXISTS (SELECT 1 FROM jsonb_array_elements("Film"."ggCategories") AS a WHERE (a->>'awardYear')::int = ANY(ARRAY[${mkYearArr()}]::int[]))
      OR EXISTS (SELECT 1 FROM jsonb_array_elements("Film"."cannesCategories") AS a WHERE (a->>'awardYear')::int = ANY(ARRAY[${mkYearArr()}]::int[]))
    )`;
    orParts.push(mkYearCheck());
    scoreParts.push(Prisma.sql`CASE WHEN ${mkYearCheck()} THEN 1 ELSE 0 END`);
  }

  if (orParts.length === 0) {
    setPublicCache(res, 3600);
    res.json([]);
    return;
  }

  type SimilarRow = {
    id: string; slug: string; title: string; originalTitle: string | null;
    releaseYear: number; year: number; genres: string[]; contentType: string;
    director: string | null;
    posterUrl: string | null; posterColor: string | null; imdbRating: number | null;
    imdbTopMovieRank: number | null; imdbTopTvRank: number | null;
    certificate: string | null; tvType: string | null;
    tvStartYear: number | null; tvEndYear: number | null;
    oscarNominations: number; oscarWins: number;
    ggNominations: number; ggWins: number;
    cannesNominations: number; cannesWins: number;
    berlinNominations: number; berlinWins: number;
  };

  const rows = await prisma.$queryRaw<SimilarRow[]>(Prisma.sql`
    SELECT
      "Film"."id",
      "Film"."slug",
      "Film"."title",
      "Film"."originalTitle",
      "Film"."year" AS "releaseYear",
      "Film"."year",
      "Film"."genres",
      "Film"."contentType",
      "Film"."director",
      "Film"."posterUrl",
      "Film"."posterColor",
      "Film"."imdbRating",
      "Film"."imdbTopMovieRank",
      "Film"."imdbTopTvRank",
      "Film"."certificate",
      "Film"."tvType",
      "Film"."tvStartYear",
      "Film"."tvEndYear",
      "Film"."oscarNominations",
      "Film"."oscarWins",
      "Film"."ggNominations",
      "Film"."ggWins",
      "Film"."cannesNominations",
      "Film"."cannesWins",
      "Film"."berlinNominations",
      "Film"."berlinWins"
    FROM "Film"
    WHERE "Film"."id" != ${film.id}
      AND (${Prisma.join(orParts, " OR ")})
    ORDER BY (${Prisma.join(scoreParts, " + ")}) DESC, "Film"."imdbRating" DESC NULLS LAST
    LIMIT 6
  `);

  setPublicCache(res, 3600);
  res.json(rows.map(f => ({ ...f, year: f.releaseYear })));
});

filmsRouter.get(
  "/:slug/comments",
  optionalAuth,
  validate(slugParamsSchema, "params"),
  validate(commentsQuerySchema, "query"),
  async (req, res) => {
    const userId = (req as OptionallyAuthedRequest).userId;
    const { slug } = getValidated<z.infer<typeof slugParamsSchema>>(req, "params");
    const { page } = getValidated<z.infer<typeof commentsQuerySchema>>(req, "query");

    const film = await prisma.film.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!film) {
      throw new HttpError(404, "Film not found", "FILM_NOT_FOUND");
    }

    const skip = (page - 1) * COMMENTS_PAGE_SIZE;
    const [comments, total] = await Promise.all([
      prisma.filmComment.findMany({
        where: { filmId: film.id, hidden: false },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip,
        take: COMMENTS_PAGE_SIZE,
        select: {
          id: true,
          userId: true,
          body: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      }),
      prisma.filmComment.count({
        where: { filmId: film.id, hidden: false },
      }),
    ]);

    res.json({
      comments: comments.map(({ userId: commentUserId, ...comment }) => ({
        ...comment,
        canDelete: userId === commentUserId,
      })),
      page,
      pageSize: COMMENTS_PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / COMMENTS_PAGE_SIZE),
    });
  },
);

filmsRouter.post(
  "/:slug/comments",
  requireAuth,
  validate(slugParamsSchema, "params"),
  validate(commentBodySchema, "body"),
  async (req, res) => {
    const userId = (req as AuthedRequest).userId;
    const { slug } = getValidated<z.infer<typeof slugParamsSchema>>(req, "params");
    const { body } = getValidated<z.infer<typeof commentBodySchema>>(req, "body");

    const film = await prisma.film.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!film) {
      throw new HttpError(404, "Film not found", "FILM_NOT_FOUND");
    }

    const watched = await prisma.watchedFilm.findUnique({
      where: { userId_filmId: { userId, filmId: film.id } },
      select: { id: true },
    });

    if (!watched) {
      throw new HttpError(403, "Only users who watched this film can comment", "FILM_NOT_WATCHED");
    }

    const comment = await prisma.filmComment.create({
      data: { userId, filmId: film.id, body },
      select: {
        id: true,
        userId: true,
        body: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    const { userId: _commentUserId, ...payload } = comment;
    res.status(201).json({ ...payload, canDelete: true });
  },
);

filmsRouter.delete(
  "/:slug/comments/:id",
  requireAuth,
  validate(commentParamsSchema, "params"),
  async (req, res) => {
    const userId = (req as AuthedRequest).userId;
    const { id } = getValidated<z.infer<typeof commentParamsSchema>>(req, "params");

    const result = await prisma.filmComment.deleteMany({
      where: { id, userId },
    });

    if (result.count === 0) {
      throw new HttpError(404, "Comment not found", "COMMENT_NOT_FOUND");
    }

    res.status(204).send();
  },
);

filmsRouter.get("/:slug", validate(slugParamsSchema, "params"), async (req, res) => {
  const { slug } = getValidated<z.infer<typeof slugParamsSchema>>(req, "params");
  // Film data only changes on reseed; cache the assembled payload by slug.
  const payload = await cache.getOrSet(cacheKeys.filmDetail(slug), FILM_DETAIL_TTL_MS, async () => {
    const film = await prisma.film.findUnique({
      where: { slug },
      select: filmDetailSelect,
    });
    if (!film) return null;
    return { ...film, year: film.releaseYear };
  });

  if (!payload) {
    throw new HttpError(404, "Film not found", "FILM_NOT_FOUND");
  }

  const ratingAggregate = await prisma.userRating.aggregate({
    where: { filmId: payload.id },
    _avg: { rating: true },
    _count: { rating: true },
  });
  const averageRating = ratingAggregate._avg.rating;

  setPublicCache(res, 300);
  res.json({
    ...payload,
    averageRating: averageRating === null ? null : Math.round(averageRating * 10) / 10,
    ratingCount: ratingAggregate._count.rating,
  });
});
