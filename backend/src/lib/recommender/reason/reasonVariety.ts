import type { ReasonPart } from "./reasonPart";

export type ReasonVariety = {
  /**
   * Picks up to `max` phrases, preferring ones this response has not used yet
   * and falling back to the highest-weighted part when everything is spent.
   * Every returned phrase is counted as used.
   */
  pickPhrases: (parts: ReasonPart[], max: number) => string[];
};

/**
 * Tracks which reason phrases a single recommendation response has already
 * spent. Without it every Drama pick reaches for the same top-weighted part
 * and the whole row reads as one sentence repeated, which looks like there is
 * no reasoning behind it at all.
 */
export const createReasonVariety = (): ReasonVariety => {
  const timesUsed = new Map<string, number>();
  const countOf = (text: string): number => timesUsed.get(text) ?? 0;

  return {
    pickPhrases: (parts, max) => {
      if (max <= 0) return [];

      // Unused first, then strongest. Sorting is stable, so parts of equal
      // weight keep the caller's order (for anchors: most recently liked).
      const chosen = [...parts]
        .sort((left, right) => countOf(left.text) - countOf(right.text) || right.weight - left.weight)
        .slice(0, max)
        .map(part => part.text);

      for (const text of chosen) timesUsed.set(text, countOf(text) + 1);

      return chosen;
    },
  };
};
