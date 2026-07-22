import { calculateVectorMagnitude } from "./calculateVectorMagnitude";
import type { SparseVector } from "./types";

export const calculateCosineSimilarity = (
  first: SparseVector,
  second: SparseVector,
): number => {
  if (first.size === 0 || second.size === 0) return 0;

  const dotProduct = calculateDotProduct(first, second);
  if (dotProduct === 0) return 0;

  return dotProduct /
    (calculateVectorMagnitude(first) * calculateVectorMagnitude(second));
};

const calculateDotProduct = (first: SparseVector, second: SparseVector): number => {
  const [small, large] = first.size <= second.size
    ? [first, second]
    : [second, first];
  let product = 0;

  for (const [token, weight] of small) {
    const otherWeight = large.get(token);
    if (otherWeight != null) product += weight * otherWeight;
  }

  return product;
};
