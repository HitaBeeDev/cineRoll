import { sampleGamma } from "./sampleGamma";
import type { RandomSource } from "./sampleStandardNormal";

// Beta(alpha, beta) via two independent Gamma draws.
export const sampleBeta = (
  alpha: number,
  beta: number,
  rng: RandomSource,
): number => {
  const alphaSample = sampleGamma(alpha, rng);
  const betaSample = sampleGamma(beta, rng);
  const total = alphaSample + betaSample;

  return total > 0 ? alphaSample / total : 0.5;
};
