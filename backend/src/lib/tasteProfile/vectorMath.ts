import { Vector } from "./types";

export function addWeight(vector: Vector, key: string | null, value: number): void {
  if (key == null) return;

  vector[key] = (vector[key] ?? 0) + value;
}

export function normalize(vector: Vector): Vector {
  const maxAbs = maxAbsoluteValue(vector);
  if (maxAbs === 0) return vector;

  return Object.fromEntries(
    Object.entries(vector).map(([key, value]) => [key, value / maxAbs]),
  );
}

function maxAbsoluteValue(vector: Vector): number {
  return Object.values(vector).reduce(
    (max, value) => Math.max(max, Math.abs(value)),
    0,
  );
}
