import type { FilmDecision, Toast } from "../types";

export function showDecisionSaved(
  toast: Toast,
  decision: FilmDecision,
  filmTitle: string,
): void {
  toast(
    decision === "watched"
      ? { variant: "success", title: "Marked as watched", description: filmTitle }
      : {
          title: "Hidden from future rolls",
          description: "We won't roll this one again.",
        },
  );
}
