import type { SparseVector } from "./types";

export const calculateVectorMagnitude = (vector: SparseVector): number => {
  let sumOfSquares = 0;

  for (const weight of vector.values()) {
    sumOfSquares += weight * weight;
  }

  return Math.sqrt(sumOfSquares);
};
