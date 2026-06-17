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
