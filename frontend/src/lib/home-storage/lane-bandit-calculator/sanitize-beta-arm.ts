import type { BetaArm } from "@/lib/api";
import { isPositiveFiniteNumber } from "./is-positive-finite-number";

export function sanitizeBetaArm(value: unknown): BetaArm | null {
  if (!value || typeof value !== "object") return null;
  const { alpha, beta } = value as Record<string, unknown>;
  if (!isPositiveFiniteNumber(alpha) || !isPositiveFiniteNumber(beta)) return null;
  return { alpha, beta };
}
