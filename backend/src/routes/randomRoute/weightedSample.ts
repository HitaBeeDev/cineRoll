export function weightedSample<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (!(total > 0)) return uniformSample(items);

  let remaining = Math.random() * total;
  for (let index = 0; index < items.length; index++) {
    remaining -= weights[index]!;
    if (remaining <= 0) return items[index]!;
  }

  return items[items.length - 1]!;
}

export function uniformSample<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}
