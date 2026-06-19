import type { WatchedSentiment } from "@prisma/client";

/**
 * Canonical mapping from a watched film's sentiment to the signed weight the
 * taste-profile builder (section 7) and recommender (section 8) feed into a
 * user's preference vectors.
 *
 * The scale is symmetric around zero: positive pulls the user's taste toward a
 * film's features, negative pushes away. Magnitudes are deliberately ordered so
 * an explicit thumbs-up/down outweighs the implicit signal of merely watching:
 *
 *   like           → strong positive
 *   dislike        → strong negative
 *   watched (null) → mild positive — choosing to watch it is a weak endorsement
 *
 * Keep these as named constants (not inline literals) so the evaluation harness
 * (section 12) can tune them as a single knob and A/B-compare model versions.
 */
export const SENTIMENT_WEIGHT = {
  like: 1,
  dislike: -1,
  /** A watched film with no explicit sentiment — they chose to watch it. */
  watchedNeutral: 0.25,
} as const;

/**
 * Weights for the non-sentiment signals the taste-profile builder consumes.
 * Kept here alongside SENTIMENT_WEIGHT so the whole signal scale is one knob.
 */
export const SIGNAL_WEIGHT = {
  /** Saving to the watchlist is intent, not a verdict — weak positive. */
  watchlistAdd: 0.4,
  /** "Not Interested" (hidden from rolls) — a clear negative. */
  notInterested: -0.6,
} as const;

export const RATING_WEIGHT = {
  /** Maximum explicit rating signal. Numeric ratings should outweigh thumbs. */
  maxPositive: 1.5,
  maxNegative: -1.5,
  /** The neutral midpoint of the 1.0–10.0 rating scale. */
  midpoint: 5.5,
} as const;

/**
 * Recency half-life in days: a signal's weight halves every 90 days, so current
 * taste outweighs old signals. weight *= 0.5 ** (ageDays / HALF_LIFE_DAYS).
 */
export const HALF_LIFE_DAYS = 90;

/** Decay multiplier for a signal of the given age. */
export function recencyDecay(ageDays: number): number {
  return Math.pow(0.5, Math.max(0, ageDays) / HALF_LIFE_DAYS);
}

/**
 * Resolve the recommender weight for a watched film given its sentiment.
 * `null`/`undefined` means watched without a thumbs rating (mild positive).
 */
export function sentimentWeight(sentiment: WatchedSentiment | null | undefined): number {
  switch (sentiment) {
    case "like":
      return SENTIMENT_WEIGHT.like;
    case "dislike":
      return SENTIMENT_WEIGHT.dislike;
    default:
      return SENTIMENT_WEIGHT.watchedNeutral;
  }
}

/**
 * Resolve a numeric 1.0–10.0 rating into the same signed signal scale.
 * Extremes intentionally outweigh thumbs-up/down; middle scores remain mild.
 */
export function ratingWeight(rating: number): number {
  if (rating >= 7) {
    return SENTIMENT_WEIGHT.like +
      ((rating - 7) / 3) * (RATING_WEIGHT.maxPositive - SENTIMENT_WEIGHT.like);
  }

  if (rating <= 4) {
    return SENTIMENT_WEIGHT.dislike +
      ((4 - rating) / 3) * (RATING_WEIGHT.maxNegative - SENTIMENT_WEIGHT.dislike);
  }

  return ((rating - RATING_WEIGHT.midpoint) / 1.5) * SENTIMENT_WEIGHT.watchedNeutral;
}
