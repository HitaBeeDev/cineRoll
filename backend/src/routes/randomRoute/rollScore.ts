import {
  PinnedDimensions,
  RecentRoll,
  RerollPenalty,
  diversityMultiplier,
  rerollMultiplier,
} from "./diversity";
import { RandomFilmRow } from "./types";

// RollScorer (docs/smart-roll-engine.md §7). After the hard eligibility gate we
// don't pick uniformly — each candidate is broken into normalized signals, and
// the picker draws a "lane" (Safe / Gem / Wild) then weights the pool by the
// signal that lane cares about. Better titles win more often, but the result is
// never fully predictable, and the lane split guarantees a steady rate of hidden
// gems and wildcards instead of "obvious classics every time."
//
// The signals (all 0..1):
//   rating     combined IMDb + RT.
//   fame       award recognition + IMDb-Top membership — the "trusted/famous" axis.
//   quality    0.65·rating + 0.35·fame — item A's composite, NOT rating alone.
//   novelty    1 − fame — rewards the less-famous, pushing back on popularity.
//   hiddenGem  rating · novelty — critically good AND obscure = underrated pick.
//   session    §6 diversity cooldown × reroll penalty — always applied, every lane.

const NEUTRAL_TASTE = 0.5;
// Wildcard floor: even low-novelty titles keep a baseline chance in the Wild
// lane, so it feels risky/surprising rather than just "most obscure film wins."
const WILD_FLOOR = 0.3;
// >1 tilts each lane toward its best candidates without going deterministic.
const LANE_SHARPNESS = 2;

// The 70 / 20 / 10 blend (§7). Even the normal roll mixes these; the future Roll
// Modes UI (§11, deferred) will just pin a single lane instead of drawing one.
export const LANE_SPLIT = { safe: 0.7, gem: 0.2, wild: 0.1 } as const;
export type RollLane = "safe" | "gem" | "wild";

export type ScoreContext = {
  recent: RecentRoll[];
  penalty: RerollPenalty;
  pinned: PinnedDimensions;
  // Optional per-film taste match in [0, 1]; omitted on the base roll (neutral).
  tasteMatch?: (film: RandomFilmRow) => number;
};

export type ScoreBreakdown = {
  quality: number;
  novelty: number;
  hiddenGem: number;
  taste: number;
  // Multiplicative session factor (cooldown × reroll), applied in every lane so
  // no lane ever serves a just-seen or just-skipped kind.
  session: number;
};

export function scoreBreakdown(film: RandomFilmRow, ctx: ScoreContext): ScoreBreakdown {
  const rating = normalizedRating(film);
  const fame = fameScore(film);

  return {
    quality: 0.65 * rating + 0.35 * fame,
    novelty: 1 - fame,
    hiddenGem: rating * (1 - fame),
    taste: ctx.tasteMatch?.(film) ?? NEUTRAL_TASTE,
    session:
      diversityMultiplier(film, ctx.recent, ctx.pinned) *
      rerollMultiplier(film, ctx.penalty, ctx.pinned),
  };
}

// Draw one lane per roll from the 70/20/10 split. Injectable RNG for testing.
export function pickLane(r: number = Math.random()): RollLane {
  if (r < LANE_SPLIT.safe) return "safe";
  if (r < LANE_SPLIT.safe + LANE_SPLIT.gem) return "gem";
  return "wild";
}

// A candidate's pick weight within the drawn lane: the lane's affinity signal,
// sharpened, times the always-on session factor.
export function laneWeight(breakdown: ScoreBreakdown, lane: RollLane): number {
  const affinity = laneAffinity(breakdown, lane);
  return Math.pow(affinity, LANE_SHARPNESS) * breakdown.session;
}

function laneAffinity(b: ScoreBreakdown, lane: RollLane): number {
  switch (lane) {
    // Trusted pick: quality-led (taste folded in for the personalized path).
    case "safe":
      return 0.6 * b.quality + 0.4 * b.taste;
    // Underrated: high rating but low fame.
    case "gem":
      return b.hiddenGem;
    // Risky wildcard: novelty-tilted but floored so it stays surprising.
    case "wild":
      return WILD_FLOOR + (1 - WILD_FLOOR) * b.novelty;
  }
}

// Combined IMDb + RT in [0, 1]. Averages when both exist, else uses whichever is
// present — the eligibility gate guarantees at least one, so the 0 is unreachable.
function normalizedRating(film: RandomFilmRow): number {
  const imdb = film.imdbRating != null ? film.imdbRating / 10 : null;
  const rt = film.rtScore != null ? film.rtScore / 100 : null;
  if (imdb != null && rt != null) return (imdb + rt) / 2;
  return imdb ?? rt ?? 0;
}

// The "trusted / famous" axis in [0, 1], from award recognition (wins weighted
// above nominations, saturating) plus IMDb-Top membership (a better rank = more
// famous). Quality reads it as a positive; novelty reads it as its inverse —
// the deliberate tension that produces the Safe-vs-Gem split rather than always
// surfacing the same celebrated winners.
function fameScore(film: RandomFilmRow): number {
  const wins = film.oscarWins + film.ggWins + film.cannesWins + film.berlinWins;
  const noms =
    film.oscarNominations + film.ggNominations + film.cannesNominations + film.berlinNominations;
  const award = 1 - Math.exp(-(2 * wins + noms) / 4);

  const topRank = film.imdbTopMovieRank ?? film.imdbTopTvRank;
  const popularity = topRank != null ? clamp01(1 - (topRank - 1) / 250) : 0;

  return clamp01(0.55 * award + 0.45 * popularity);
}

function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}
