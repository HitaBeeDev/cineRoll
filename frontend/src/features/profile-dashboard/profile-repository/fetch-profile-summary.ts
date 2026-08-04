import { apiFetch } from "@/lib/apiWithAuth";
import { EMPTY_PROFILE_SUMMARY } from "@/features/profile-dashboard/empty-profile-data/empty-profile-summary";
import type { ProfileSummary } from "../domain-types";
import { mapProfileSummary } from "../map-profile-summary";

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
