import { describe, expect, it } from "vitest";

import { EXPLORATION_EPSILON, SOFTMAX_TEMPERATURE } from "../src/routes/randomRoute/constants";
import { softmaxWeights } from "../src/routes/randomRoute/personalizedService";
import { uniformSample, weightedSample } from "../src/routes/randomRoute/weightedSample";

// Large N + loose tolerances → the assertions sit ~15σ+ from the mean, so these
// statistical tests don't flake even without a seedable RNG.
const N = 40_000;

function tally<T>(draws: () => T, times: number): Map<T, number> {
  const counts = new Map<T, number>();
  for (let i = 0; i < times; i++) {
    const value = draws();
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

function probabilities(weights: number[]): number[] {
  const total = weights.reduce((sum, w) => sum + w, 0);
  return weights.map(w => w / total);
}

describe("weightedSample", () => {
  it("draws items in proportion to their weights", () => {
    const items = ["a", "b", "c"] as const;
    const weights = [1, 3, 6]; // → 0.1 / 0.3 / 0.6
    const counts = tally(() => weightedSample([...items], weights), N);

    expect(counts.get("a")! / N).toBeCloseTo(0.1, 1);
    expect(counts.get("b")! / N).toBeCloseTo(0.3, 1);
    expect(counts.get("c")! / N).toBeCloseTo(0.6, 1);
    // Higher weight ⇒ sampled more, and every positive-weight item appears.
    expect(counts.get("c")!).toBeGreaterThan(counts.get("b")!);
    expect(counts.get("b")!).toBeGreaterThan(counts.get("a")!);
  });

  it("never draws a zero-weight item, but falls back to uniform when all weights are zero", () => {
    const zeroMiddle = tally(() => weightedSample(["a", "b", "c"], [4, 0, 4]), N);
    expect(zeroMiddle.get("b") ?? 0).toBe(0);
    expect(zeroMiddle.get("a")! / N).toBeCloseTo(0.5, 1);

    const allZero = tally(() => weightedSample(["a", "b", "c"], [0, 0, 0]), N);
    // total ≤ 0 → uniform fallback: every item ~1/3.
    for (const key of ["a", "b", "c"]) {
      expect(allZero.get(key)! / N).toBeCloseTo(1 / 3, 1);
    }
  });
});

describe("softmaxWeights", () => {
  it("is monotonic in score (higher score ⇒ higher weight)", () => {
    const weights = softmaxWeights([0, 1, 2, 3], SOFTMAX_TEMPERATURE);
    for (let i = 1; i < weights.length; i++) {
      expect(weights[i]!).toBeGreaterThan(weights[i - 1]!);
    }
  });

  it("lower temperature sharpens the bias toward the top score", () => {
    const scores = [2, 1, 0];
    const sharp = probabilities(softmaxWeights(scores, 0.25));
    const soft = probabilities(softmaxWeights(scores, 5));

    // The top score claims more of the mass at low temperature …
    expect(sharp[0]!).toBeGreaterThan(soft[0]!);
    // … and the top-vs-runner-up ratio is steeper.
    expect(sharp[0]! / sharp[1]!).toBeGreaterThan(soft[0]! / soft[1]!);
    // A high temperature flattens toward uniform: less mass on top, more on the tail.
    expect(soft[0]!).toBeLessThan(0.5);
    expect(soft[2]!).toBeGreaterThan(sharp[2]!);
  });

  it("makes high-score films dominate the exploit draw", () => {
    const scores = [5, 2, 1, 0];
    const weights = softmaxWeights(scores);
    const counts = tally(() => weightedSample([0, 1, 2, 3], weights), N);

    // The top-scoring film is drawn far more than any other …
    const top = counts.get(0)!;
    for (const i of [1, 2, 3]) expect(top).toBeGreaterThan(counts.get(i)! * 3);
    // … while a much lower score is nearly starved under exploit alone.
    expect((counts.get(3) ?? 0) / N).toBeLessThan(0.02);
  });
});

describe("ε-greedy sampler (exploration guarantee)", () => {
  it("keeps every film reachable even when one score dominates", () => {
    // One film's score dominates → its softmax weight is ~1 and the rest ~0, so
    // the exploit branch would starve them. This mirrors getPersonalizedRandomFilm:
    // explore (uniform) with probability ε, otherwise exploit (softmax-weighted).
    const pool = [0, 1, 2, 3];
    const weights = softmaxWeights([20, 0, 0, 0]);

    const counts = tally(
      () =>
        Math.random() < EXPLORATION_EPSILON
          ? uniformSample(pool)
          : weightedSample(pool, weights),
      N,
    );

    // Every film keeps a non-zero probability …
    for (const film of pool) expect(counts.get(film) ?? 0).toBeGreaterThan(0);

    // … and a starved film's frequency matches the exploration rate ε·(1/n):
    // it's reachable *only* through uniform exploration.
    const expectedFloor = EXPLORATION_EPSILON / pool.length; // 0.15/4 = 0.0375
    expect((counts.get(3)! / N)).toBeCloseTo(expectedFloor, 1);

    // The dominant film still wins overall (exploit share + its exploration share).
    expect(counts.get(0)!).toBeGreaterThan(counts.get(3)!);
  });
});
