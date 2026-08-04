import type { Toast } from "../types";

export function showAlreadySaved(toast: Toast, filmTitle: string): void {
  toast({ title: "Already saved", description: filmTitle });
}
