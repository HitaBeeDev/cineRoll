import type { LanePosteriors } from "./types";

// Safe-heavy informative priors preserve cold-start behavior while remaining
// weak enough for a small amount of real feedback to move the policy.
export const PRIOR_POSTERIORS: LanePosteriors = {
  safe: { alpha: 4, beta: 2 },
  gem: { alpha: 2, beta: 4 },
  wild: { alpha: 1, beta: 3 },
};
