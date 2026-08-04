import type { CompletionProgress } from "@cineroll/types";

export const EMPTY_COMPLETION_PROGRESS: CompletionProgress = {
  overall: { watched: 0, total: 0, percentage: 0 },
  categories: [],
};
