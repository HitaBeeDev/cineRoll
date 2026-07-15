import type { Recommendation } from "@/types/recommendation";
import type { RecommendationsResult } from "./domain-types";
import { EMPTY_RECOMMENDATIONS_RESULT } from "./empty-profile-data";

export function parseRecommendationsResponse(
  data: unknown,
): RecommendationsResult {
  if (!isRecord(data)) return EMPTY_RECOMMENDATIONS_RESULT;
  if (data.code === "NOT_ENOUGH_DATA") {
    return { ...EMPTY_RECOMMENDATIONS_RESULT, notEnoughData: true };
  }
  if (!Array.isArray(data.recommendations)) {
    return EMPTY_RECOMMENDATIONS_RESULT;
  }
  if (typeof data.coldStart !== "boolean") {
    return EMPTY_RECOMMENDATIONS_RESULT;
  }

  return {
    recommendations: data.recommendations as Recommendation[],
    coldStart: data.coldStart,
    notEnoughData: false,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
