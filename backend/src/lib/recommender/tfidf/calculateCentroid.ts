import type { SparseVector } from "./types";

export const calculateCentroid = (vectors: SparseVector[]): SparseVector => {
  if (vectors.length === 0) return new Map();

  const centroid = sumVectors(vectors);
  for (const [token, weight] of centroid) {
    centroid.set(token, weight / vectors.length);
  }

  return centroid;
};

const sumVectors = (vectors: SparseVector[]): SparseVector => {
  const sum: SparseVector = new Map();

  for (const vector of vectors) {
    for (const [token, weight] of vector) {
      sum.set(token, (sum.get(token) ?? 0) + weight);
    }
  }

  return sum;
};
