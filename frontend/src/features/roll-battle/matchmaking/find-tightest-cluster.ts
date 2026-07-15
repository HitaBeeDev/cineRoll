export function findTightestCluster(
  distanceMatrix: number[][],
  size: number,
): number[] {
  let bestCluster: number[] = [];
  let bestCost = Number.POSITIVE_INFINITY;

  distanceMatrix.forEach((seedDistances, seed) => {
    const neighbours = seedDistances
      .map((distance, index) => ({ distance, index }))
      .filter(({ index }) => index !== seed)
      .sort((left, right) => left.distance - right.distance)
      .slice(0, size - 1);
    const cost = neighbours.reduce(
      (total, neighbour) => total + neighbour.distance,
      0,
    );
    if (cost < bestCost) {
      bestCost = cost;
      bestCluster = [seed, ...neighbours.map(({ index }) => index)];
    }
  });

  return bestCluster;
}
