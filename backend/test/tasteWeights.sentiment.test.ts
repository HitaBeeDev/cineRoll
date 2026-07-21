import { describe, expect, it } from "vitest";

import { SENTIMENT_WEIGHT, sentimentWeight } from "../src/lib/tasteWeights";

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
