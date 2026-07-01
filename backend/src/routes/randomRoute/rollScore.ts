import {
  PinnedDimensions,
  RecentRoll,
  RerollPenalty,
  diversityMultiplier,
  rerollMultiplier,
} from "./diversity";
import { RandomFilmRow } from "./types";

// RollScorer (docs/smart-roll-engine.md §7). After the hard eligibility gate,
// each candidate gets a composite score; the caller turns scores into weights
// and does a weighted random pick, so better titles are *more likely* but the
// result is never fully predictable — "score 90 beats score 40, but 40 still
// wins sometimes." That controlled randomness is the point.
//
//   score =  quality  * 40   normalized IMDb/RT (soft quality floor, not a cut)
//         +  taste    * 30   per-user match; neutral for guests / base roll
//         +  novelty  * 15   rewards less-famous picks (anti "always classics")
//         +  diversity* 10   rewards differing from recent rolls (§6 cooldown, +sign)
//         +  hiddenGem*  5   high quality AND obscure = underrated pick
//         -  reroll         decaying penalty on kinds the user skipped (§6)
//
// The §6 cooldown lives here as the positive `diversity` term (its own inverse),
// so we don't also subtract a separate genre/type penalty — same signal, counted
// once. Reroll learning is the one subtractive term.
const WEIGHT = {
  quality: 40,
  taste: 30,
  novelty: 15,
  diversity: 10,
  hiddenGem: 5,
} as const;

// A guest (or the non-personalized base roll) has no taste vector, so every
// candidate gets the same neutral taste term — a constant that cancels out of
// the relative ranking. Kept in the formula so signing the personalized path in
// later (§4 collapse) is a one-line change, not a re-plumb.
const NEUTRAL_TASTE = 0.5;

// How hard the reroll penalty bites, in score points, at full strength.
const REROLL_PENALTY_WEIGHT = 30;

export type ScoreContext = {
  recent: RecentRoll[];
  penalty: RerollPenalty;
  pinned: PinnedDimensions;
  // Optional per-film taste match in [0, 1]; omitted on the base roll (neutral).
  tasteMatch?: (film: RandomFilmRow) => number;
};

export function scoreCandidate(film: RandomFilmRow, ctx: ScoreContext): number {
  const quality = normalizedRating(film);
  const taste = ctx.tasteMatch?.(film) ?? NEUTRAL_TASTE;
  const novelty = noveltyScore(film);
  const diversity = diversityMultiplier(film, ctx.recent, ctx.pinned);
  const hiddenGem = quality * novelty;
  const rerollKept = rerollMultiplier(film, ctx.penalty, ctx.pinned);

  return (
    quality * WEIGHT.quality +
    taste * WEIGHT.taste +
    novelty * WEIGHT.novelty +
    diversity * WEIGHT.diversity +
    hiddenGem * WEIGHT.hiddenGem -
    (1 - rerollKept) * REROLL_PENALTY_WEIGHT
  );
}

// Combined IMDb + RT in [0, 1]. Averages when both exist, else uses whichever is
// present — the eligibility gate guarantees at least one, so the 0 is unreachable.
function normalizedRating(film: RandomFilmRow): number {
  const imdb = film.imdbRating != null ? film.imdbRating / 10 : null;
  const rt = film.rtScore != null ? film.rtScore / 100 : null;
  if (imdb != null && rt != null) return (imdb + rt) / 2;
  return imdb ?? rt ?? 0;
}

// Novelty in [0, 1] = the inverse of "fame". Fame comes from two signals we
// already carry: sitting on an IMDb Top list (a better rank = more famous) and
// racking up major award wins (saturating). A film with neither reads as novel,
// pushing back against the popularity gravity well of pure rating weighting.
function noveltyScore(film: RandomFilmRow): number {
  let fame = 0;

  const topRank = film.imdbTopMovieRank ?? film.imdbTopTvRank;
  if (topRank != null) fame += 0.6 * (1 - clamp01((topRank - 1) / 250));

  const wins = film.oscarWins + film.ggWins + film.cannesWins + film.berlinWins;
  fame += 0.4 * (1 - Math.exp(-wins / 3));

  return clamp01(1 - fame);
}

function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}
