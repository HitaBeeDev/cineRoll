import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

/**
 * Pick of the Day — deterministic per calendar day.
 *
 * The same date always yields the same film (it's recorded in `PickOfDayHistory`
 * on first computation and read back thereafter). The choice scores the prestige
 * catalog by award weight + rating, rewards **under-exposure** (films that have
 * been rolled little recently), and adds a date-seeded term so the pick rotates
 * day to day instead of always landing on the single most-awarded title. Films
 * featured within the last `NO_REPEAT_DAYS` days are excluded so picks don't
 * repeat.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Don't feature the same film again within this many days (a full year). If
 *  the prestige pool is smaller than this, the exclusion relaxes automatically
 *  (see getPickOfDay) so a pick is always produced. */
const NO_REPEAT_DAYS = 365;
/** Window over which recent roll volume counts as "exposure". */
const ROLL_WINDOW_DAYS = 14;
/** Cap on the scored pool (ordered by prestige) — keeps scoring cheap. */
const POOL_SIZE = 800;

// Score weights. Quality is normalized to [0,1]; the others are added on top.
const WEIGHT_UNDER_EXPOSURE = 0.45;
const WEIGHT_DAILY_SEED = 0.5;

export type PickRow = {
  id: string; slug: string; title: string; originalTitle: string | null;
  releaseYear: number; runtime: number | null; genres: string[]; contentType: string;
  plot: string | null; director: string | null; posterUrl: string | null;
  posterColor: string | null; backdropUrl: string | null;
  imdbRating: number | null; rtScore: number | null;
  oscarNominations: number; oscarWins: number;
  ggNominations: number; ggWins: number;
  cannesNominations: number; cannesWins: number;
};

type PoolRow = PickRow & { prestige: number; rollCount: number };

export const pickOfDaySelect = {
  id: true, slug: true, title: true, originalTitle: true, releaseYear: true,
  runtime: true, genres: true, contentType: true, plot: true, director: true,
  posterUrl: true, posterColor: true, backdropUrl: true, imdbRating: true, rtScore: true,
  oscarNominations: true, oscarWins: true, ggNominations: true, ggWins: true,
  cannesNominations: true, cannesWins: true,
} satisfies Prisma.FilmSelect;

const POOL_COLUMNS = Prisma.raw(`
  f."id", f."slug", f."title", f."originalTitle",
  f."year" AS "releaseYear",
  f."runtime", f."genres", f."contentType", f."plot", f."director",
  f."posterUrl", f."posterColor", f."backdropUrl",
  f."imdbRating", f."rtScore",
  f."oscarNominations", f."oscarWins",
  f."ggNominations", f."ggWins",
  f."cannesNominations", f."cannesWins"
`);

/** Midnight-UTC Date for the calendar day, the stable key for a day's pick. */
function calendarDay(date: Date): Date {
  return new Date(`${date.toISOString().slice(0, 10)}T00:00:00.000Z`);
}

/** Deterministic value in [0,1) from a string (FNV-1a) — the per-day jitter. */
function seededUnit(key: string): number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1_000_000) / 1_000_000;
}

async function fetchPick(filmId: string): Promise<PickRow | null> {
  return prisma.film.findUnique({ where: { id: filmId }, select: pickOfDaySelect });
}

/** Score the pool for `dateKey` and return the winning film id (or null if the
 *  pool is empty). Pure given its inputs, so it's deterministic per day. */
function selectFromPool(pool: PoolRow[], dateKey: string): string | null {
  if (pool.length === 0) return null;

  let minPrestige = Infinity;
  let maxPrestige = -Infinity;
  let maxRolls = 0;
  for (const f of pool) {
    minPrestige = Math.min(minPrestige, f.prestige);
    maxPrestige = Math.max(maxPrestige, f.prestige);
    maxRolls = Math.max(maxRolls, f.rollCount);
  }
  const prestigeRange = maxPrestige - minPrestige || 1;

  let best: { id: string; score: number } | null = null;
  for (const f of pool) {
    const quality = (f.prestige - minPrestige) / prestigeRange;
    const underExposure = maxRolls > 0 ? 1 - f.rollCount / maxRolls : 1;
    const seed = seededUnit(`${dateKey}:${f.id}`);
    const score =
      quality + WEIGHT_UNDER_EXPOSURE * underExposure + WEIGHT_DAILY_SEED * seed;

    // Deterministic tie-break by id so equal scores never flip between runs.
    if (best === null || score > best.score || (score === best.score && f.id < best.id)) {
      best = { id: f.id, score };
    }
  }
  return best?.id ?? null;
}

async function loadPool(excludeIds: string[]): Promise<PoolRow[]> {
  const rollWindow = new Date(Date.now() - ROLL_WINDOW_DAYS * DAY_MS);
  const excludeSql =
    excludeIds.length > 0
      ? Prisma.sql`AND f."id" NOT IN (${Prisma.join(excludeIds)})`
      : Prisma.empty;

  return prisma.$queryRaw<PoolRow[]>(Prisma.sql`
    SELECT ${POOL_COLUMNS},
      (
        f."oscarWins" * 4 + f."ggWins" * 2 + f."cannesWins" * 3 + f."berlinWins" * 3
        + f."oscarNominations" + f."ggNominations" * 0.5
        + f."cannesNominations" + f."berlinNominations"
        + COALESCE(f."imdbRating", 0) + COALESCE(f."rtScore", 0) / 10.0
      )::float8 AS "prestige",
      COALESCE(r.cnt, 0)::int AS "rollCount"
    FROM "Film" f
    LEFT JOIN (
      SELECT "filmId", COUNT(*)::int AS cnt
      FROM "RollEvent"
      WHERE "rolledAt" >= ${rollWindow}
      GROUP BY "filmId"
    ) r ON r."filmId" = f."id"
    WHERE f."posterUrl" IS NOT NULL
      AND (
        f."oscarWins" + f."ggWins" + f."cannesWins" + f."berlinWins"
        + f."oscarNominations" + f."ggNominations" + f."cannesNominations" + f."berlinNominations" > 0
        OR f."imdbRating" >= 7.5
      )
      ${excludeSql}
    ORDER BY "prestige" DESC
    LIMIT ${POOL_SIZE}
  `);
}

export type PickOfDayResult = { film: PickRow; fromHistory: boolean };

/**
 * The Pick of the Day for `date`. Returns the recorded pick if today already has
 * one; otherwise computes it, records it in history (to prevent repeats and lock
 * the day's choice), and returns it. Returns null only when the catalog has no
 * prestige films at all (caller handles the fallback).
 */
export async function getPickOfDay(date: Date = new Date()): Promise<PickOfDayResult | null> {
  const day = calendarDay(date);

  const existing = await prisma.pickOfDayHistory.findUnique({ where: { date: day } });
  if (existing) {
    const film = await fetchPick(existing.filmId);
    if (film) return { film, fromHistory: true };
    // Recorded film was deleted — fall through and pick a fresh one for today.
    await prisma.pickOfDayHistory.delete({ where: { date: day } }).catch(() => {});
  }

  const recentCutoff = new Date(day.getTime() - NO_REPEAT_DAYS * DAY_MS);
  const recent = await prisma.pickOfDayHistory.findMany({
    where: { date: { gte: recentCutoff } },
    select: { filmId: true },
  });
  const excludeIds = [...new Set(recent.map(r => r.filmId))];

  // Score the no-repeat pool first; if everything recent is excluded and the
  // pool comes back empty, relax the exclusion so a pick is always produced.
  let pool = await loadPool(excludeIds);
  if (pool.length === 0 && excludeIds.length > 0) pool = await loadPool([]);

  const dateKey = day.toISOString().slice(0, 10);
  const chosenId = selectFromPool(pool, dateKey);
  if (!chosenId) return null;

  try {
    await prisma.pickOfDayHistory.create({ data: { filmId: chosenId, date: day } });
  } catch (error) {
    // Another request recorded today's pick first — use theirs (deterministic,
    // so it's almost always the same film anyway).
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const winner = await prisma.pickOfDayHistory.findUnique({ where: { date: day } });
      const film = winner ? await fetchPick(winner.filmId) : null;
      if (film) return { film, fromHistory: true };
    } else {
      throw error;
    }
  }

  const film = pool.find(f => f.id === chosenId);
  if (!film) return null;
  const { prestige: _p, rollCount: _r, ...display } = film;
  return { film: display, fromHistory: false };
}
