import type { FilmDecision, Toast } from "../types";

export function showReplayedDecision(
  toast: Toast,
  decision: FilmDecision,
  filmTitle: string,
): void {
  toast({
    variant: decision === "watched" ? "success" : "default",
    title:
      decision === "watched" ? "Marked as watched" : "Hidden from future rolls",
    description: filmTitle,
  });
}
