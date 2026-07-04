import { describe, expect, it } from "vitest";

import {
  RATING_WEIGHT,
  SENTIMENT_WEIGHT,
  ratingWeight,
  sentimentWeight,
} from "../src/lib/tasteWeights";

describe("sentimentWeight", () => {
  it("maps like → strong positive, dislike → strong negative", () => {
    expect(sentimentWeight("like")).toBe(SENTIMENT_WEIGHT.like);
    expect(sentimentWeight("dislike")).toBe(SENTIMENT_WEIGHT.dislike);
    expect(sentimentWeight("like")).toBeGreaterThan(0);
    expect(sentimentWeight("dislike")).toBeLessThan(0);
  });

  it("treats a watched film with no thumbs as a mild positive (neutral)", () => {
    expect(sentimentWeight(null)).toBe(SENTIMENT_WEIGHT.watchedNeutral);
    expect(sentimentWeight(undefined)).toBe(SENTIMENT_WEIGHT.watchedNeutral);
    expect(sentimentWeight(null)).toBeGreaterThan(0);
  });

  it("orders dislike < neutral < like, with thumbs outweighing the neutral watch", () => {
    const like = sentimentWeight("like");
    const neutral = sentimentWeight(null);
    const dislike = sentimentWeight("dislike");
    expect(dislike).toBeLessThan(neutral);
    expect(neutral).toBeLessThan(like);
    expect(Math.abs(like)).toBeGreaterThan(neutral);
    expect(Math.abs(dislike)).toBeGreaterThan(neutral);
  });
});

describe("ratingWeight", () => {
  it("puts the scale midpoint at ≈ neutral (0)", () => {
    expect(ratingWeight(RATING_WEIGHT.midpoint)).toBeCloseTo(0, 10);
  });

  it("boosts ratings ≥ 7: a 7 matches a thumbs-up, a 10 hits the ceiling", () => {
    expect(ratingWeight(7)).toBeCloseTo(SENTIMENT_WEIGHT.like, 10);
    expect(ratingWeight(10)).toBeCloseTo(RATING_WEIGHT.maxPositive, 10);
    expect(ratingWeight(8)).toBeGreaterThan(0);
  });

  it("penalizes ratings ≤ 4: a 4 matches a thumbs-down, a 1 hits the floor", () => {
    expect(ratingWeight(4)).toBeCloseTo(SENTIMENT_WEIGHT.dislike, 10);
    expect(ratingWeight(1)).toBeCloseTo(RATING_WEIGHT.maxNegative, 10);
    expect(ratingWeight(3)).toBeLessThan(0);
  });

  it("lets rating extremes outweigh a plain thumbs-up/down", () => {
    expect(ratingWeight(10)).toBeGreaterThan(sentimentWeight("like"));
    expect(ratingWeight(1)).toBeLessThan(sentimentWeight("dislike"));
  });

  it("keeps mid-band scores mild (below the neutral-watch magnitude)", () => {
    expect(Math.abs(ratingWeight(6))).toBeLessThan(SENTIMENT_WEIGHT.watchedNeutral);
    expect(Math.abs(ratingWeight(5))).toBeLessThan(SENTIMENT_WEIGHT.watchedNeutral);
  });

  it("is monotonically increasing across the full 1–10 range", () => {
    const ratings = [1, 2, 3, 4, 5, 5.5, 6, 7, 8, 9, 10];
    for (let i = 1; i < ratings.length; i++) {
      expect(ratingWeight(ratings[i]!)).toBeGreaterThan(ratingWeight(ratings[i - 1]!));
    }
  });
});
