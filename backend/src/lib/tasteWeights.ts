import type { WatchedSentiment } from "@prisma/client";

/**
 * Canonical mapping from a watched film's sentiment to the signed weight the
 * taste-profile builder (section 7) and recommender (section 8) feed into a
 * user's preference vectors.
 *
 * The scale is symmetric around zero: positive pulls the user's taste toward a
 * film's features, negative pushes away. Magnitudes are deliberately ordered so
 * an explicit verdict outweighs the implicit signal of merely watching:
 *
 *   love           → strongest positive
 *   like           → strong positive
 *   dislike        → strong negative
 *   watched (null) → mild positive — choosing to watch it is a weak endorsement
 *
 * Only the RATIOS between these matter. aggregateTasteVectors normalizes every
 * vector by its largest absolute weight, so scaling this whole table by any
 * constant produces an identical model. That leaves exactly one free parameter
 * when a level is added: its ratio to the levels already here.
 *
 * `love` therefore ships equal to `like`. That is not a placeholder chosen for
 * convenience — it is the only value that cannot degrade ranking. Nobody has
 * ever pressed a button that did not exist, so there is no love-labelled data
 * to fit against yet, and any ratio above 1.0 would be a number invented by
 * hand and silently baked into everyone's taste vectors. Weighted equal, the new
 * level is a strict no-op for the model while it collects the data that lets the
 * harness derive the real ratio:
 *
 *   npx tsx src/scripts/evalRecommender.ts --love-weight=1,1.25,1.5,2
 *
 * Pick the arm that wins on MRR / recall@k, set it here, and delete this note.
 */
export const SENTIMENT_WEIGHT = {
  love: 1,
  like: 1,
  dislike: -1,
  /** A watched film with no explicit sentiment — they chose to watch it. */
  watchedNeutral: 0.25,
} as const;

/**
 * The sentiments that count as an endorsement. Anything reading "films this user
 * liked" must go through this rather than comparing to "like", or every loved
 * film silently disappears from the set.
 */
export const POSITIVE_SENTIMENTS: readonly WatchedSentiment[] = ["like", "love"];

/** True for a sentiment that counts as an endorsement. */
export function isPositiveSentiment(
  sentiment: WatchedSentiment | null | undefined,
): boolean {
  return sentiment != null && POSITIVE_SENTIMENTS.includes(sentiment);
}

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

/**
 * Recency half-life in days: a signal's weight halves every 90 days, so current
 * taste outweighs old signals. weight *= 0.5 ** (ageDays / HALF_LIFE_DAYS).
 */
export const HALF_LIFE_DAYS = 90;

/** Decay multiplier for a signal of the given age. */
export function recencyDecay(ageDays: number): number {
  return Math.pow(0.5, Math.max(0, ageDays) / HALF_LIFE_DAYS);
}

/** The shape sentimentWeight resolves against — SENTIMENT_WEIGHT, or a sweep arm
 *  overriding it. */
export type SentimentWeights = {
  readonly love: number;
  readonly like: number;
  readonly dislike: number;
  readonly watchedNeutral: number;
};

/**
 * Resolve the recommender weight for a watched film given its sentiment.
 * `null`/`undefined` means watched without a rating (mild positive).
 *
 * `weights` exists so the offline harness can evaluate an arm without mutating
 * the module constant; production always uses the default.
 */
export function sentimentWeight(
  sentiment: WatchedSentiment | null | undefined,
  weights: SentimentWeights = SENTIMENT_WEIGHT,
): number {
  switch (sentiment) {
    case "love":
      return weights.love;
    case "like":
      return weights.like;
    case "dislike":
      return weights.dislike;
    default:
      return weights.watchedNeutral;
  }
}
