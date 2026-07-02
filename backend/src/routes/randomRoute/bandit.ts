// Multi-armed bandit over the roll's three lanes (Safe / Gem / Wild).
//
// The lane split used to be a hard-coded 70/20/10 (see `rollScore.ts` LANE_SPLIT)
// — a *static policy* that never learns. This replaces the draw with **Thompson
// sampling**: each lane is an "arm" with a Beta(α, β) posterior over "how often
// does a roll from this lane earn engagement (open / save / watch)?". To pick a
// lane we draw one sample from each arm's Beta and take the argmax, so a lane is
// chosen in proportion to the probability it is currently the best — automatic
// explore-vs-exploit with no ε to tune. Feedback nudges the posteriors, so the
// roll adapts to what an individual user actually engages with.
//
// Why Thompson over ε-greedy: it explores more where it's uncertain and less
// where it's confident, needs no exploration constant, and is Bayesian — a
// cleaner story than "explore 15% of the time no matter what."

import { RollLane } from "./rollScore";

export type BetaArm = { alpha: number; beta: number };
export type LanePosteriors = Record<RollLane, BetaArm>;

export const LANES: readonly RollLane[] = ["safe", "gem", "wild"] as const;

// Informative priors that reproduce today's Safe-heavy behaviour on a cold start
// (means ≈ 0.67 / 0.33 / 0.25), with modest strength so a handful of real
// engagements can move them. The bandit *starts* where the hand-tuned split was
// and adapts from there, rather than exploring blindly on a new user.
export const PRIOR_POSTERIORS: LanePosteriors = {
  safe: { alpha: 4, beta: 2 },
  gem: { alpha: 2, beta: 4 },
  wild: { alpha: 1, beta: 3 },
};

// Cap on an arm's evidence (α + β). Past this we shrink both toward the prior,
// giving the posterior a sliding memory: the bandit keeps adapting to a shifting
// taste instead of freezing once it has seen enough rolls (non-stationary reward).
const MAX_ARM_STRENGTH = 60;

export function initialPosteriors(): LanePosteriors {
  return {
    safe: { ...PRIOR_POSTERIORS.safe },
    gem: { ...PRIOR_POSTERIORS.gem },
    wild: { ...PRIOR_POSTERIORS.wild },
  };
}

// Thompson draw: sample once from each arm's Beta, pick the lane with the
// highest sample. RNG is injectable for deterministic tests.
export function thompsonPickLane(
  posteriors: LanePosteriors,
  rng: () => number = Math.random,
): RollLane {
  let bestLane: RollLane = "safe";
  let bestSample = -Infinity;

  for (const lane of LANES) {
    const arm = posteriors[lane];
    const sample = sampleBeta(arm.alpha, arm.beta, rng);
    if (sample > bestSample) {
      bestSample = sample;
      bestLane = lane;
    }
  }

  return bestLane;
}

// Fold a reward for the lane that was served into its posterior. `reward` is in
// [0, 1] — 1 for engagement (opened / saved / watched), 0 for a skip; partial
// signals (e.g. a mere detail-open) can pass something in between.
export function updateArm(
  posteriors: LanePosteriors,
  lane: RollLane,
  reward: number,
): LanePosteriors {
  const clampedReward = clamp01(reward);
  const arm = posteriors[lane];
  const updated: BetaArm = {
    alpha: arm.alpha + clampedReward,
    beta: arm.beta + (1 - clampedReward),
  };

  return { ...posteriors, [lane]: decay(updated) };
}

// The current expected engagement rate of each lane — handy for debugging,
// metrics, and a "why this lane" explanation. Not used in the draw itself.
export function laneMeans(posteriors: LanePosteriors): Record<RollLane, number> {
  return {
    safe: mean(posteriors.safe),
    gem: mean(posteriors.gem),
    wild: mean(posteriors.wild),
  };
}

function decay(arm: BetaArm): BetaArm {
  const strength = arm.alpha + arm.beta;
  if (strength <= MAX_ARM_STRENGTH) return arm;

  const scale = MAX_ARM_STRENGTH / strength;
  return { alpha: arm.alpha * scale, beta: arm.beta * scale };
}

function mean(arm: BetaArm): number {
  return arm.alpha / (arm.alpha + arm.beta);
}

// Beta(α, β) via two Gamma draws: X = G1 / (G1 + G2), G1~Gamma(α), G2~Gamma(β).
function sampleBeta(alpha: number, beta: number, rng: () => number): number {
  const g1 = sampleGamma(alpha, rng);
  const g2 = sampleGamma(beta, rng);
  const total = g1 + g2;

  return total > 0 ? g1 / total : 0.5;
}

// Marsaglia–Tsang sampler for Gamma(shape, scale=1). Handles shape < 1 via the
// standard boost trick. Our shapes are small positive reals, which this covers.
function sampleGamma(shape: number, rng: () => number): number {
  if (shape < 1) {
    const boost = sampleGamma(shape + 1, rng);
    return boost * Math.pow(rng() || Number.MIN_VALUE, 1 / shape);
  }

  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);

  for (;;) {
    let x = 0;
    let v = 0;
    do {
      x = standardNormal(rng);
      v = 1 + c * x;
    } while (v <= 0);

    v = v * v * v;
    const u = rng();
    if (u < 1 - 0.0331 * x * x * x * x) return d * v;
    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

// Box–Muller standard normal.
function standardNormal(rng: () => number): number {
  const u1 = rng() || Number.MIN_VALUE;
  const u2 = rng();

  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}
