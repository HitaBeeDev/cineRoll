import { WatchedSentiment } from "@prisma/client";
import { describe, expect, it } from "vitest";

import {
  POSITIVE_SENTIMENTS,
  SENTIMENT_WEIGHT,
  isPositiveSentiment,
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

  it("orders dislike < neutral < like ≤ love", () => {
    const love = sentimentWeight("love");
    const like = sentimentWeight("like");
    const neutral = sentimentWeight(null);
    const dislike = sentimentWeight("dislike");

    expect(dislike).toBeLessThan(neutral);
    expect(neutral).toBeLessThan(like);
    // Equal while love ships unweighted; never below, which would make the
    // stronger endorsement count for less.
    expect(love).toBeGreaterThanOrEqual(like);
    expect(Math.abs(like)).toBeGreaterThan(neutral);
    expect(Math.abs(dislike)).toBeGreaterThan(neutral);
  });

  // The guard that matters: a new level added to the Prisma enum without a
  // weight would fall through the switch to watchedNeutral, quietly recording a
  // strong verdict as a shrug. This fails the moment that happens.
  it("has a weight for every sentiment the database can store", () => {
    for (const value of Object.values(WatchedSentiment)) {
      expect(SENTIMENT_WEIGHT).toHaveProperty(value);
      expect(sentimentWeight(value)).toBe(
        SENTIMENT_WEIGHT[value as keyof typeof SENTIMENT_WEIGHT],
      );
    }
  });

  it("resolves against a sweep arm's weights when given one", () => {
    const arm = { ...SENTIMENT_WEIGHT, love: 2 };

    expect(sentimentWeight("love", arm)).toBe(2);
    // The arm must not leak into the other levels.
    expect(sentimentWeight("like", arm)).toBe(SENTIMENT_WEIGHT.like);
    expect(sentimentWeight("love")).toBe(SENTIMENT_WEIGHT.love);
  });
});

describe("isPositiveSentiment", () => {
  it("counts both endorsement levels, not just like", () => {
    expect(isPositiveSentiment("like")).toBe(true);
    expect(isPositiveSentiment("love")).toBe(true);
  });

  it("excludes dislike and the unrated watch", () => {
    expect(isPositiveSentiment("dislike")).toBe(false);
    expect(isPositiveSentiment(null)).toBe(false);
    expect(isPositiveSentiment(undefined)).toBe(false);
  });

  // Anything reading "films this user liked" goes through POSITIVE_SENTIMENTS.
  // If a level with a positive weight were missing from it, that level's films
  // would vanish from the recommender's liked pool and the eval harness's
  // ground truth — silently, since nothing throws.
  it("lists every sentiment carrying a positive weight", () => {
    const positiveByWeight = Object.values(WatchedSentiment).filter(
      value => sentimentWeight(value) > 0,
    );

    expect([...POSITIVE_SENTIMENTS].sort()).toEqual(positiveByWeight.sort());
  });
});
