import type { Toast } from "../types";

export function showSaveError(toast: Toast, filmTitle?: string): void {
  toast({
    variant: "error",
    title: "Couldn't save",
    description: filmTitle ?? "Check your connection and try again.",
  });
}
