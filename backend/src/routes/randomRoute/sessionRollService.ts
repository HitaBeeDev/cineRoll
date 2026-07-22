import { Prisma } from "@prisma/client";

import type { RandomQuery } from "../../lib/filmFilters/randomQuerySchema";
import { prisma } from "../../lib/prisma";
import { DIVERSITY_SAMPLE_SIZE } from "./constants";
import { RECENT_ROLL_WINDOW } from "./diversity/decayPolicy";
import { getMainGenre } from "./diversity/getMainGenre";
import { getPinnedDimensions } from "./diversity/getPinnedDimensions";
import { getReleaseDecade } from "./diversity/getReleaseDecade";
import type { RecentRoll, RerollPenalty } from "./diversity/types";
import { createInitialPosteriors } from "./bandit/createInitialPosteriors";
import { pickLaneWithThompsonSampling } from "./bandit/pickLaneWithThompsonSampling";
import type { LanePosteriors } from "./bandit/types";
import { updateLanePosterior } from "./bandit/updateLanePosterior";
import { loadLanePosteriors, persistLanePosteriors } from "./banditRepository";
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

  const [{ films, total }, recent, posteriors] = await Promise.all([
    getRandomFilms(query, DIVERSITY_SAMPLE_SIZE),
    getRecentRolls(query.excludeIds ?? []),
    resolvePosteriors(query),
  ]);
  if (films.length <= 1) return { film: films[0] ?? null, total };

  const ctx: ScoreContext = {
    recent,
    penalty: rerollPenaltyFrom(query),
    pinned: getPinnedDimensions(query),
  };

  // Thompson-sample the lane from the resolved posteriors, then weight + sample
  // within it. For signed-in users we echo the posteriors back so their client
  // can sync the DB-authoritative state.
  const lane = pickLaneWithThompsonSampling(posteriors);
  return {
    film: pickByLane(films, ctx, lane),
    total,
    lane,
    posteriors: query.userId ? posteriors : undefined,
  };
}

// Where the lane posteriors come from: for signed-in users, the DB is the source
// of truth — we load them, fold in the previous roll's engagement reward, and
// persist before drawing. Guests carry their own state in the `bandit` query
// param (localStorage), falling back to the cold-start priors on a first roll.
async function resolvePosteriors(query: RandomQuery): Promise<LanePosteriors> {
  if (!query.userId) return query.bandit ?? createInitialPosteriors();

  let posteriors = await loadLanePosteriors(query.userId);
  if (query.banditFeedback) {
    posteriors = updateLanePosterior(
      posteriors,
      query.banditFeedback.lane,
      query.banditFeedback.reward,
    );
    await persistLanePosteriors(query.userId, posteriors);
  }

  return posteriors;
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
      genre: getMainGenre(row.genres),
      contentType: row.contentType,
      decade: getReleaseDecade(row.year),
      director: row.director,
    }));
}
