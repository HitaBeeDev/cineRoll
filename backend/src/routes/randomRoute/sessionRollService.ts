import { Prisma } from "@prisma/client";

import { RandomQuery } from "../../lib/filmFilters/randomQuerySchema";
import { prisma } from "../../lib/prisma";
import { DIVERSITY_SAMPLE_SIZE } from "./constants";
import {
  RECENT_ROLL_WINDOW,
  RecentRoll,
  RerollPenalty,
  decadeOf,
  diversityMultiplier,
  hasRerollPenalty,
  mainGenre,
  pinnedDimensions,
  rerollMultiplier,
} from "./diversity";
import { getRandomFilm, getRandomFilms } from "./randomRepository";
import { RandomFilmResult } from "./types";
import { weightedSample } from "./weightedSample";

// The non-personalized ("base") roll, with §6 session diversity applied. Instead
// of a single uniform pick, we draw a random candidate sample and weight it by
// how *different* each candidate is from the last few rolls, then sample one.
// This keeps the roll surprising while making back-to-back same-genre / same-
// decade results unlikely — the "app is thinking" feel — without a hard ban.
//
// Falls back to the plain uniform pick (getRandomFilm) whenever diversity can't
// or shouldn't apply: a deterministic seed roll (daily picks), or a fresh
// session with no history to diversify against.
export async function getSessionRoll(query: RandomQuery): Promise<RandomFilmResult> {
  if (query.seed) return getRandomFilm(query);

  const penalty = rerollPenaltyFrom(query);
  const recent = await getRecentRolls(query.excludeIds ?? []);
  // Nothing to diversify against and no reroll feedback → a plain uniform pick.
  if (recent.length === 0 && !hasRerollPenalty(penalty)) return getRandomFilm(query);

  const { films, total } = await getRandomFilms(query, DIVERSITY_SAMPLE_SIZE);
  if (films.length <= 1) return { film: films[0] ?? null, total };

  const pinned = pinnedDimensions(query);
  // Two session signals compound into one weight: the cooldown (avoid what just
  // showed) and reroll learning (avoid what the user skipped). Both are soft.
  const weights = films.map(
    film => diversityMultiplier(film, recent, pinned) * rerollMultiplier(film, penalty, pinned),
  );

  return { film: weightedSample(films, weights), total };
}

function rerollPenaltyFrom(query: RandomQuery): RerollPenalty {
  return {
    genre: query.rerollGenre ?? {},
    contentType: query.rerollType ?? {},
  };
}

type RecentRollRow = {
  id: string;
  genres: string[];
  contentType: string;
  year: number | null;
  director: string | null;
};

// Rebuild the recent-roll window from the tail of the session shuffle-bag. The
// client sends `excludeIds` oldest→newest, so the last N are the N most recent
// rolls; we fetch just their diversity dimensions and return them most-recent
// first, which is what the decay tables expect.
async function getRecentRolls(orderedSeenIds: string[]): Promise<RecentRoll[]> {
  const tail = orderedSeenIds.slice(-RECENT_ROLL_WINDOW);
  if (tail.length === 0) return [];

  const rows = await prisma.$queryRaw<RecentRollRow[]>(Prisma.sql`
    SELECT "Film"."id", "Film"."genres", "Film"."contentType", "Film"."year", "Film"."director"
    FROM "Film"
    WHERE "Film"."id" IN (${Prisma.join(tail)})
  `);
  const byId = new Map(rows.map(row => [row.id, row]));

  return tail
    .slice()
    .reverse()
    .map(id => byId.get(id))
    .filter((row): row is RecentRollRow => row != null)
    .map(row => ({
      genre: mainGenre(row.genres),
      contentType: row.contentType,
      decade: decadeOf(row.year),
      director: row.director,
    }));
}
