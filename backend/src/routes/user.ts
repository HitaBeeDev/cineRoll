import { Router } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { logEvent } from "../lib/events";
import { prisma } from "../lib/prisma";
import { markTasteProfileStale } from "../lib/tasteProfile";
import { AuthedRequest, requireAuth } from "../middleware/auth";
import { HttpError } from "../middleware/errorHandler";
import { getValidated, validate } from "../middleware/validate";

export const userRouter = Router();

userRouter.use(requireAuth);

const filmIdBodySchema = z.object({
  filmId: z.string().trim().min(1),
});

const watchedBodySchema = filmIdBodySchema.extend({
  doNotSuggest: z.boolean().default(false),
  sentiment: z.enum(["like", "dislike"]).nullable().optional(),
});

const ratingBodySchema = filmIdBodySchema.extend({
  rating: z.number()
    .min(1)
    .max(10)
    .refine(value => Number.isInteger(value * 2), "Rating must be a multiple of 0.5"),
});

const filmIdParamsSchema = z.object({
  filmId: z.string().trim().min(1),
});

const onboardingBodySchema = z.object({
  genres: z.array(z.string().trim().min(1)).max(30),
});

// Cursor pagination for the per-user lists (watchlist, watched). The cursor is
// the last row's id; ordering by [timestamp desc, id desc] keeps it stable even
// when timestamps tie. Default page is generous since these lists are modest.
const PAGE_LIMIT_DEFAULT = 20;
const cursorQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(PAGE_LIMIT_DEFAULT),
  cursor: z.string().trim().min(1).optional(),
});
type CursorQuery = z.infer<typeof cursorQuerySchema>;

const filmSummarySelect = {
  id: true,
  slug: true,
  title: true,
  originalTitle: true,
  releaseYear: true,
  genres: true,
  contentType: true,
  posterUrl: true,
  posterColor: true,
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
  ggNominations: true,
  ggWins: true,
  cannesNominations: true,
  cannesWins: true,
  berlinNominations: true,
  berlinWins: true,
} satisfies Prisma.FilmSelect;

type FilmSummary = Prisma.FilmGetPayload<{ select: typeof filmSummarySelect }>;

function getUserId(req: Parameters<typeof getValidated>[0]): string {
  return (req as AuthedRequest).userId;
}

function withYear(film: FilmSummary) {
  return { ...film, year: film.releaseYear };
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

async function assertFilmExists(filmId: string) {
  const film = await prisma.film.findUnique({
    where: { id: filmId },
    select: { id: true },
  });

  if (!film) {
    throw new HttpError(404, "Film not found", "FILM_NOT_FOUND");
  }
}

// Persist the first-visit onboarding genre preferences to the account so the
// taste profile can seed from them on cold-start. Flushed from the client once
// the user signs in (onboarding happens before auth).
userRouter.post("/onboarding", validate(onboardingBodySchema, "body"), async (req, res) => {
  const userId = getUserId(req);
  const { genres } = getValidated<z.infer<typeof onboardingBodySchema>>(req, "body");

  await prisma.user.update({
    where: { id: userId },
    data: { onboardingGenres: genres },
  });

  await markTasteProfileStale(userId);
  res.status(204).send();
});

userRouter.get("/watchlist", validate(cursorQuerySchema, "query"), async (req, res) => {
  const userId = getUserId(req);
  const { limit, cursor } = getValidated<CursorQuery>(req, "query");

  // Fetch one extra row to detect whether another page exists.
  const entries = await prisma.watchlist.findMany({
    where: { userId },
    orderBy: [{ addedAt: "desc" }, { id: "desc" }],
    include: { film: { select: filmSummarySelect } },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = entries.length > limit;
  const page = hasMore ? entries.slice(0, limit) : entries;

  res.json({
    watchlist: page.map(({ film, ...entry }) => ({
      ...entry,
      film: withYear(film),
    })),
    nextCursor: hasMore ? page[page.length - 1]!.id : null,
  });
});

userRouter.post("/watchlist", validate(filmIdBodySchema, "body"), async (req, res) => {
  const userId = getUserId(req);
  const { filmId } = getValidated<z.infer<typeof filmIdBodySchema>>(req, "body");

  await assertFilmExists(filmId);

  try {
    const entry = await prisma.watchlist.create({
      data: { userId, filmId },
      include: { film: { select: filmSummarySelect } },
    });

    await logEvent({
      type: "watchlist_add",
      userId,
      filmId,
      context: { source: "user_route" },
    });

    await markTasteProfileStale(userId);

    const { film, ...watchlistEntry } = entry;
    res.status(201).json({ ...watchlistEntry, film: withYear(film) });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new HttpError(409, "Film is already in watchlist", "WATCHLIST_ALREADY_EXISTS");
    }
    throw error;
  }
});

userRouter.delete("/watchlist/:filmId", validate(filmIdParamsSchema, "params"), async (req, res) => {
  const userId = getUserId(req);
  const { filmId } = getValidated<z.infer<typeof filmIdParamsSchema>>(req, "params");

  const result = await prisma.watchlist.deleteMany({
    where: { userId, filmId },
  });

  if (result.count === 0) {
    throw new HttpError(404, "Watchlist entry not found", "WATCHLIST_ENTRY_NOT_FOUND");
  }

  await logEvent({
    type: "watchlist_remove",
    userId,
    filmId,
    context: { source: "user_route" },
  });

  await markTasteProfileStale(userId);

  res.status(204).send();
});

userRouter.get("/watched", validate(cursorQuerySchema, "query"), async (req, res) => {
  const userId = getUserId(req);
  const { limit, cursor } = getValidated<CursorQuery>(req, "query");

  const entries = await prisma.watchedFilm.findMany({
    where: { userId },
    orderBy: [{ watchedAt: "desc" }, { id: "desc" }],
    include: { film: { select: filmSummarySelect } },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = entries.length > limit;
  const page = hasMore ? entries.slice(0, limit) : entries;

  res.json({
    watched: page.map(({ film, ...entry }) => ({
      ...entry,
      film: withYear(film),
    })),
    nextCursor: hasMore ? page[page.length - 1]!.id : null,
  });
});

// Counts for the profile greeting row: saved / watched / hidden-from-rolls.
// "Hidden" is a watched row flagged doNotSuggest (Not Interested); "watched" is
// everything else, so the two partition the WatchedFilm rows.
userRouter.get("/summary", async (req, res) => {
  const userId = getUserId(req);

  const [watchlist, watched, hidden] = await Promise.all([
    prisma.watchlist.count({ where: { userId } }),
    prisma.watchedFilm.count({ where: { userId, doNotSuggest: false } }),
    prisma.watchedFilm.count({ where: { userId, doNotSuggest: true } }),
  ]);

  res.json({ watchlist, watched, hidden });
});

// Combined per-film status for the signed-in user — lets the post-roll card
// reflect existing watchlist / watched / sentiment state on mount in one trip.
userRouter.get("/film-status/:filmId", validate(filmIdParamsSchema, "params"), async (req, res) => {
  const userId = getUserId(req);
  const { filmId } = getValidated<z.infer<typeof filmIdParamsSchema>>(req, "params");

  const [watchedEntry, watchlistEntry, ratingEntry] = await Promise.all([
    prisma.watchedFilm.findUnique({
      where: { userId_filmId: { userId, filmId } },
      select: { sentiment: true, doNotSuggest: true },
    }),
    prisma.watchlist.findUnique({
      where: { userId_filmId: { userId, filmId } },
      select: { id: true },
    }),
    prisma.userRating.findUnique({
      where: { userId_filmId: { userId, filmId } },
      select: { rating: true },
    }),
  ]);

  res.json({
    watched: watchedEntry !== null,
    sentiment: watchedEntry?.sentiment ?? null,
    doNotSuggest: watchedEntry?.doNotSuggest ?? false,
    inWatchlist: watchlistEntry !== null,
    rating: ratingEntry?.rating ?? null,
  });
});

userRouter.post("/ratings", validate(ratingBodySchema, "body"), async (req, res) => {
  const userId = getUserId(req);
  const { filmId, rating } = getValidated<z.infer<typeof ratingBodySchema>>(req, "body");

  await assertFilmExists(filmId);

  const entry = await prisma.userRating.upsert({
    where: { userId_filmId: { userId, filmId } },
    create: { userId, filmId, rating },
    update: { rating },
  });

  await logEvent({
    type: "rating_set",
    userId,
    filmId,
    context: { source: "user_route", rating },
  });

  await markTasteProfileStale(userId);

  res.json(entry);
});

userRouter.get("/ratings/:filmId", validate(filmIdParamsSchema, "params"), async (req, res) => {
  const userId = getUserId(req);
  const { filmId } = getValidated<z.infer<typeof filmIdParamsSchema>>(req, "params");

  const entry = await prisma.userRating.findUnique({
    where: { userId_filmId: { userId, filmId } },
  });

  if (!entry) {
    throw new HttpError(404, "Rating not found", "RATING_NOT_FOUND");
  }

  res.json(entry);
});

userRouter.delete("/ratings/:filmId", validate(filmIdParamsSchema, "params"), async (req, res) => {
  const userId = getUserId(req);
  const { filmId } = getValidated<z.infer<typeof filmIdParamsSchema>>(req, "params");

  const result = await prisma.userRating.deleteMany({
    where: { userId, filmId },
  });

  if (result.count === 0) {
    throw new HttpError(404, "Rating not found", "RATING_NOT_FOUND");
  }

  await markTasteProfileStale(userId);

  res.status(204).send();
});

userRouter.post("/watched", validate(watchedBodySchema, "body"), async (req, res) => {
  const userId = getUserId(req);
  const { filmId, doNotSuggest, sentiment } = getValidated<z.infer<typeof watchedBodySchema>>(req, "body");

  await assertFilmExists(filmId);

  const sentimentData = sentiment === undefined ? {} : { sentiment };
  const entry = await prisma.watchedFilm.upsert({
    where: { userId_filmId: { userId, filmId } },
    create: { userId, filmId, doNotSuggest, sentiment: sentiment ?? null },
    update: { doNotSuggest, watchedAt: new Date(), ...sentimentData },
    include: { film: { select: filmSummarySelect } },
  });

  await logEvent({
    type: doNotSuggest ? "not_interested" : "watched",
    userId,
    filmId,
    context: {
      source: "user_route",
      doNotSuggest,
      sentiment: sentiment ?? null,
    },
  });

  if (sentiment !== undefined) {
    await logEvent({
      type: "sentiment_set",
      userId,
      filmId,
      context: { sentiment },
    });
  }

  // Any watched / not-interested / sentiment change shifts the taste profile.
  await markTasteProfileStale(userId);

  const { film, ...watchedEntry } = entry;
  res.json({ ...watchedEntry, film: withYear(film) });
});

userRouter.delete("/watched/:filmId", validate(filmIdParamsSchema, "params"), async (req, res) => {
  const userId = getUserId(req);
  const { filmId } = getValidated<z.infer<typeof filmIdParamsSchema>>(req, "params");

  const result = await prisma.watchedFilm.deleteMany({
    where: { userId, filmId },
  });

  if (result.count === 0) {
    throw new HttpError(404, "Watched entry not found", "WATCHED_ENTRY_NOT_FOUND");
  }

  await logEvent({
    type: "watched",
    userId,
    filmId,
    context: {
      source: "user_route",
      action: "remove",
    },
  });

  await markTasteProfileStale(userId);

  res.status(204).send();
});
