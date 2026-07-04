import { describe, expect, it } from "vitest";

import { HALF_LIFE_DAYS, recencyDecay } from "../src/lib/tasteWeights";

describe("recencyDecay", () => {
  it("is 1.0 for a brand-new signal", () => {
    expect(recencyDecay(0)).toBe(1);
  });

  it("halves at the 90-day half-life", () => {
    expect(recencyDecay(HALF_LIFE_DAYS)).toBeCloseTo(0.5, 10);
  });

  it("halves again at each further half-life", () => {
    expect(recencyDecay(2 * HALF_LIFE_DAYS)).toBeCloseTo(0.25, 10);
    expect(recencyDecay(3 * HALF_LIFE_DAYS)).toBeCloseTo(0.125, 10);
  });

  it("clamps a negative age (future-dated signal) to 1.0", () => {
    expect(recencyDecay(-1)).toBe(1);
    expect(recencyDecay(-10_000)).toBe(1);
  });

  it("decreases monotonically as age grows", () => {
    expect(recencyDecay(30)).toBeGreaterThan(recencyDecay(60));
    expect(recencyDecay(60)).toBeGreaterThan(recencyDecay(90));
    expect(recencyDecay(90)).toBeGreaterThan(recencyDecay(180));
  });

  it("approaches 0 as age grows without reaching it", () => {
    const veryOld = recencyDecay(100 * HALF_LIFE_DAYS);
    expect(veryOld).toBeGreaterThan(0);
    expect(veryOld).toBeLessThan(1e-6);
  });
});
