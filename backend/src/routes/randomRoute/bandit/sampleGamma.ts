import { sampleStandardNormal, type RandomSource } from "./sampleStandardNormal";

// Marsaglia-Tsang Gamma(shape, scale=1), including the shape < 1 boost.
export const sampleGamma = (shape: number, rng: RandomSource): number => {
  if (shape < 1) {
    const boostedSample = sampleGamma(shape + 1, rng);
    return boostedSample * Math.pow(rng() || Number.MIN_VALUE, 1 / shape);
  }

  const offset = shape - 1 / 3;
  const scale = 1 / Math.sqrt(9 * offset);

  for (;;) {
    const proposal = createPositiveProposal(scale, rng);
    const uniform = rng();
    const normalFourthPower = proposal.normal ** 4;

    if (uniform < 1 - 0.0331 * normalFourthPower) return offset * proposal.volume;
    const threshold = 0.5 * proposal.normal ** 2
      + offset * (1 - proposal.volume + Math.log(proposal.volume));
    if (Math.log(uniform) < threshold) return offset * proposal.volume;
  }
};

const createPositiveProposal = (
  scale: number,
  rng: RandomSource,
): { normal: number; volume: number } => {
  for (;;) {
    const normal = sampleStandardNormal(rng);
    const root = 1 + scale * normal;
    if (root > 0) return { normal, volume: root ** 3 };
  }
};
