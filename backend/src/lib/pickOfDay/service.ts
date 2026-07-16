import { Prisma } from "@prisma/client";

import { PICK_OF_DAY_CONFIG } from "./constants";
import { calendarDay, dateKey, daysBefore } from "./date";
import {
  createPickHistory,
  deletePickHistory,
  fetchPick,
  findPickHistory,
  findRecentPickFilmIds,
  loadPool,
} from "./repository";
import { selectFromPool } from "./scorer";
import { PickOfDayResult, PickRow, PoolRow } from "./types";

export async function getPickOfDay(date: Date = new Date()): Promise<PickOfDayResult | null> {
  const day = calendarDay(date);
  const historicalPick = await getHistoricalPick(day);
  if (historicalPick) return historicalPick;

  const pool = await loadEligiblePool(day);
  const chosenId = selectFromPool(pool, dateKey(day));
  if (!chosenId) return null;

  const concurrentPick = await recordPick(chosenId, day);
  if (concurrentPick) return concurrentPick;

  return resultFromPool(pool, chosenId);
}

async function getHistoricalPick(day: Date): Promise<PickOfDayResult | null> {
  const existing = await findPickHistory(day);
  if (!existing) return null;

  const film = await fetchPick(existing.filmId);
  if (film) return { film, fromHistory: true };

  await deletePickHistory(day);
  return null;
}

async function loadEligiblePool(day: Date): Promise<PoolRow[]> {
  const recentCutoff = daysBefore(day, PICK_OF_DAY_CONFIG.noRepeatDays);
  const excludeIds = await findRecentPickFilmIds(recentCutoff);
  const pool = await loadPool(excludeIds);

  // If a year of no-repeats has exhausted the whole pool, allowing repeats
  // beats serving nothing.
  if (pool.length === 0 && excludeIds.length > 0) {
    return loadPool([]);
  }

  return pool;
}

// Persist today's pick. Two concurrent requests can race to be "first" on a new
// day; the unique constraint on the day makes the DB the referee — the loser
// discards its own choice and serves whatever the winner recorded, so everyone
// still sees one film.
async function recordPick(
  filmId: string,
  day: Date,
): Promise<PickOfDayResult | null> {
  try {
    await createPickHistory(filmId, day);
    return null;
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return getHistoricalPick(day);
    }

    throw error;
  }
}

function isUniqueConstraintError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

function resultFromPool(pool: PoolRow[], chosenId: string): PickOfDayResult | null {
  const film = pool.find(candidate => candidate.id === chosenId);
  if (!film) return null;

  return { film: toPickRow(film), fromHistory: false };
}

function toPickRow(film: PoolRow): PickRow {
  const { prestige: _prestige, rollCount: _rollCount, ...display } = film;
  return display;
}
