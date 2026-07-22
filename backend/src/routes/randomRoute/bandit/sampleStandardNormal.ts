export type RandomSource = () => number;

// Box-Muller transform for a standard normal sample.
export const sampleStandardNormal = (rng: RandomSource): number => {
  const firstUniform = rng() || Number.MIN_VALUE;
  const secondUniform = rng();

  return Math.sqrt(-2 * Math.log(firstUniform))
    * Math.cos(2 * Math.PI * secondUniform);
};
