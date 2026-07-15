import "server-only";
import type { CompletionProgress } from "@cineroll/types";
import { apiFetch } from "@/lib/apiWithAuth";
import {
  EMPTY_COMPLETION_PROGRESS,
  EMPTY_PROFILE_SUMMARY,
  EMPTY_RECOMMENDATIONS_RESULT,
} from "./empty-profile-data";
import type {
  ProfileSummary,
  RecommendationsResult,
} from "./domain-types";
import { mapProfileSummary } from "./map-profile-summary";
import { parseRecommendationsResponse } from "./parse-recommendations-response";

export async function fetchProfileSummary(): Promise<ProfileSummary> {
  try {
    const response = await apiFetch("/api/user/summary");
    if (!response.ok) return EMPTY_PROFILE_SUMMARY;
    const data = (await response.json().catch(() => ({}))) as Partial<ProfileSummary>;
    return mapProfileSummary(data);
  } catch {
    return EMPTY_PROFILE_SUMMARY;
  }
}

export async function fetchCompletionProgress(): Promise<CompletionProgress> {
  try {
    const response = await apiFetch("/api/user/progress");
    if (!response.ok) return EMPTY_COMPLETION_PROGRESS;
    return (await response.json().catch(() => EMPTY_COMPLETION_PROGRESS)) as CompletionProgress;
  } catch {
    return EMPTY_COMPLETION_PROGRESS;
  }
}

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
