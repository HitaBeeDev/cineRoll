import type { Toast } from "../types";

export function showUndoError(toast: Toast, filmTitle?: string): void {
  toast({
    variant: "error",
    title: "Couldn't undo",
    description: filmTitle ?? "Check your connection and try again.",
  });
}
