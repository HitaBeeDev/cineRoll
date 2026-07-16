// Roulette-wheel draw: pick index i with probability weights[i] / total, in one
// pass and without materializing a cumulative array.
export function weightedSample<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  // `!(total > 0)` (not `total <= 0`) also catches NaN — degrade to uniform
  // rather than biasing toward index 0 or looping forever.
  if (!(total > 0)) return uniformSample(items);

  let remaining = Math.random() * total;
  for (let index = 0; index < items.length; index++) {
    remaining -= weights[index]!;
    if (remaining <= 0) return items[index]!;
  }

  // Only reachable via floating-point drift in the subtraction; the last item
  // is the mathematically correct owner of the remaining sliver.
  return items[items.length - 1]!;
}

export function uniformSample<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}
