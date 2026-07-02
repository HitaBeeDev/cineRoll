import { describe, expect, it } from "vitest";

import { eloUpdate, expectedScore, INITIAL_RATING, kFactor } from "../src/routes/rollBattleRoute/elo";

describe("expectedScore", () => {
  it("is 0.5 for equal ratings", () => {
    expect(expectedScore(1500, 1500)).toBeCloseTo(0.5, 10);
  });

  it("favors the higher-rated side and is symmetric", () => {
    const strong = expectedScore(1700, 1500);
    const weak = expectedScore(1500, 1700);
    expect(strong).toBeGreaterThan(0.5);
    expect(strong + weak).toBeCloseTo(1, 10);
  });
});

describe("kFactor", () => {
  it("steps down as a film plays more games", () => {
    expect(kFactor(0)).toBeGreaterThan(kFactor(15));
    expect(kFactor(15)).toBeGreaterThan(kFactor(50));
  });
});

describe("eloUpdate", () => {
  it("rewards the winner and penalizes the loser by symmetric amounts at equal K", () => {
    const { winnerDelta, loserDelta } = eloUpdate(1500, 50, 1500, 50);
    expect(winnerDelta).toBeGreaterThan(0);
    expect(loserDelta).toBeLessThan(0);
    expect(winnerDelta).toBeCloseTo(-loserDelta, 10); // same K, mirror-image move
  });

  it("moves less when a strong favorite beats a weak underdog", () => {
    const upset = eloUpdate(1400, 50, 1800, 50); // underdog wins: big swing
    const expected = eloUpdate(1800, 50, 1400, 50); // favorite wins: small swing
    expect(upset.winnerDelta).toBeGreaterThan(expected.winnerDelta);
  });

  it("uses each side's own K so a provisional film moves faster than a settled one", () => {
    const { winnerDelta, loserDelta } = eloUpdate(1500, 0, 1500, 100);
    expect(Math.abs(winnerDelta)).toBeGreaterThan(Math.abs(loserDelta));
  });

  it("starts everyone from the standard 1500", () => {
    expect(INITIAL_RATING).toBe(1500);
  });
});
