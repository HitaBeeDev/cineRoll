import type { FilmDecision, Toast } from "../types";

export function showDecisionUndone(
  toast: Toast,
  decision: FilmDecision,
  filmTitle: string,
): void {
  toast(
    decision === "watched"
      ? { title: "Removed from your history", description: filmTitle }
      : { title: "Back in your rolls", description: filmTitle },
  );
}
