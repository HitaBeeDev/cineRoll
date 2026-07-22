import { describe, it, expect } from "vitest";

import {
  calculateLaneMeans,
} from "../src/routes/randomRoute/bandit/calculateLaneMeans";
import { createInitialPosteriors } from "../src/routes/randomRoute/bandit/createInitialPosteriors";
import { pickLaneWithThompsonSampling } from "../src/routes/randomRoute/bandit/pickLaneWithThompsonSampling";
import type { LanePosteriors } from "../src/routes/randomRoute/bandit/types";
import { updateLanePosterior } from "../src/routes/randomRoute/bandit/updateLanePosterior";
import { RollLane } from "../src/routes/randomRoute/rollScore";

// Deterministic RNG (mulberry32) so Thompson draws are reproducible in tests.
function seededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function laneCounts(posteriors: LanePosteriors, rng: () => number, draws: number) {
  const counts: Record<RollLane, number> = { safe: 0, gem: 0, wild: 0 };
  for (let i = 0; i < draws; i++) counts[pickLaneWithThompsonSampling(posteriors, rng)]++;
  return counts;
}

describe("updateLanePosterior", () => {
  it("raises a lane's mean on a reward and lowers it on a skip", () => {
    const start = createInitialPosteriors();
    const before = calculateLaneMeans(start).gem;

    const rewarded = updateLanePosterior(start, "gem", 1);
    const punished = updateLanePosterior(start, "gem", 0);

    expect(calculateLaneMeans(rewarded).gem).toBeGreaterThan(before);
    expect(calculateLaneMeans(punished).gem).toBeLessThan(before);
  });

  it("only touches the lane that was served", () => {
    const start = createInitialPosteriors();
    const updated = updateLanePosterior(start, "wild", 1);

    expect(updated.safe).toEqual(start.safe);
    expect(updated.gem).toEqual(start.gem);
    expect(updated.wild).not.toEqual(start.wild);
  });

  it("does not mutate the input posteriors", () => {
    const start = createInitialPosteriors();
    updateLanePosterior(start, "safe", 1);

    expect(start).toEqual(createInitialPosteriors());
  });

  it("caps arm strength so it keeps adapting (sliding memory)", () => {
    let posteriors = createInitialPosteriors();
    for (let i = 0; i < 500; i++) {
      posteriors = updateLanePosterior(posteriors, "safe", 1);
    }

    const { alpha, beta } = posteriors.safe;
    expect(alpha + beta).toBeLessThanOrEqual(60 + 1e-6);
  });
});

describe("pickLaneWithThompsonSampling", () => {
  it("defaults to a Safe-heavy split on a cold start", () => {
    const counts = laneCounts(createInitialPosteriors(), seededRng(42), 3000);

    expect(counts.safe).toBeGreaterThan(counts.gem);
    expect(counts.gem).toBeGreaterThan(counts.wild);
  });

  it("shifts toward a lane that consistently earns engagement", () => {
    // Teach it that Wild always engages and Safe never does.
    let posteriors = createInitialPosteriors();
    for (let i = 0; i < 80; i++) {
      posteriors = updateLanePosterior(posteriors, "wild", 1);
      posteriors = updateLanePosterior(posteriors, "safe", 0);
    }

    const counts = laneCounts(posteriors, seededRng(7), 3000);

    // Wild should now dominate the draw despite starting as the rarest lane.
    expect(counts.wild).toBeGreaterThan(counts.safe);
    expect(counts.wild).toBeGreaterThan(counts.gem);
  });

  it("always returns a valid lane", () => {
    const rng = seededRng(123);
    for (let i = 0; i < 200; i++) {
      expect(["safe", "gem", "wild"]).toContain(
        pickLaneWithThompsonSampling(createInitialPosteriors(), rng),
      );
    }
  });
});
