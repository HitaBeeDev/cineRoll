import type { RerollPenalty } from "@/lib/api";
import { createEmptyRerollPenalty } from "./create-empty-reroll-penalty";

function sanitizeWeights(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, number] => {
      const weight = entry[1];
      return typeof weight === "number" && Number.isFinite(weight) && weight > 0;
    }),
  );
}

export function sanitizeRerollPenalty(value: unknown): RerollPenalty {
  if (!value || typeof value !== "object") return createEmptyRerollPenalty();
  const penalty = value as Partial<RerollPenalty>;
  return {
    genre: sanitizeWeights(penalty.genre),
    contentType: sanitizeWeights(penalty.contentType),
  };
}
