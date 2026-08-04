import { apiFetch } from "@/lib/apiWithAuth";
import { EMPTY_RECOMMENDATIONS_RESULT } from "@/features/profile-dashboard/empty-profile-data/empty-recommendations-result";
import type { RecommendationsResult } from "../domain-types";
import { parseRecommendationsResponse } from "../parse-recommendations-response";

export async function fetchRecommendations(): Promise<RecommendationsResult> {
  try {
    const response = await apiFetch("/api/recommendations?limit=8");
    if (!response.ok) return EMPTY_RECOMMENDATIONS_RESULT;
    const data: unknown = await response.json().catch(() => null);
    return parseRecommendationsResponse(data);
  } catch {
    return EMPTY_RECOMMENDATIONS_RESULT;
  }
}
