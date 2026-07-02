import { Prisma } from "@prisma/client";

import { RandomQuery } from "../../lib/filmFilters/randomQuerySchema";
import { prisma } from "../../lib/prisma";
import { DIVERSITY_SAMPLE_SIZE } from "./constants";
import {
  RECENT_ROLL_WINDOW,
  RecentRoll,
  RerollPenalty,
  decadeOf,
  mainGenre,
  pinnedDimensions,
} from "./diversity";
import { initialPosteriors, thompsonPickLane } from "./bandit";
import { getRandomFilm, getRandomFilms } from "./randomRepository";
import { RollLane, ScoreContext, laneWeight, scoreBreakdown } from "./rollScore";
import { RandomFilmResult, RandomFilmRow } from "./types";
import { weightedSample } from "./weightedSample";

// The non-personalized ("base") roll — §7 weighted scoring instead of a pure
// uniform pick. We draw a random candidate sample, then pick one via the 70/20/10
// lane blend: mostly Safe (trusted quality), a steady share of Hidden Gems
// (underrated), and the occasional Wild Card. Better titles win more often, the
// result stays unpredictable, and the roll never fixates on obvious classics.
//
// The only path that stays a plain pick is a deterministic seed roll (daily
// picks), which must resolve the same film for everyone on a given day.
export async function getSessionRoll(query: RandomQuery): Promise<RandomFilmResult> {
  if (query.seed) return getRandomFilm(query);

  const [{ films, total }, recent] = await Promise.all([
    getRandomFilms(query, DIVERSITY_SAMPLE_SIZE),
    getRecentRolls(query.excludeIds ?? []),
  ]);
  if (films.length <= 1) return { film: films[0] ?? null, total };

  const ctx: ScoreContext = {
    recent,
    penalty: rerollPenaltyFrom(query),
    pinned: pinnedDimensions(query),
  };

  // Thompson-sample the lane from the user's learned posteriors (or cold-start
  // priors when the client hasn't sent any yet), then weight + sample within it.
  const lane = thompsonPickLane(query.bandit ?? initialPosteriors());
  return { film: pickByLane(films, ctx, lane), total, lane };
}

// Weight the pool by what the drawn lane rewards, and sample one.
// `weightedSample`'s own guard falls back to uniform if every weight collapses
// to ~0, so a heavily-penalized/thin pool self-heals rather than dead-ending (§10).
function pickByLane(films: RandomFilmRow[], ctx: ScoreContext, lane: RollLane): RandomFilmRow {
  const weights = films.map(film => laneWeight(scoreBreakdown(film, ctx), lane));

  return weightedSample(films, weights);
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
