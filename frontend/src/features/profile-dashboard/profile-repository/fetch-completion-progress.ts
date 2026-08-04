import type { CompletionProgress } from "@cineroll/types";
import { apiFetch } from "@/lib/apiWithAuth";
import { EMPTY_COMPLETION_PROGRESS } from "@/features/profile-dashboard/empty-profile-data/empty-completion-progress";
export async function fetchCompletionProgress(): Promise<CompletionProgress> {
  try {
    const response = await apiFetch("/api/user/progress");
    if (!response.ok) return EMPTY_COMPLETION_PROGRESS;
    return (await response.json().catch(() => EMPTY_COMPLETION_PROGRESS)) as CompletionProgress;
  } catch {
    return EMPTY_COMPLETION_PROGRESS;
  }
}
