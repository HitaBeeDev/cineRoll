import type { FilmDecision, Toast } from "../types";

// Longer than the default toast: this one carries an Undo the user has to read,
// decide on, and reach before it goes.
const UNDO_TOAST_DURATION = 6500;

export function showDecisionSaved(
  toast: Toast,
  decision: FilmDecision,
  filmTitle: string,
  onUndo: () => void,
): void {
  const action = { label: "Undo", onClick: onUndo };
  toast(
    decision === "watched"
      ? {
          variant: "success",
          title: "Marked as watched",
          description: filmTitle,
          action,
          duration: UNDO_TOAST_DURATION,
        }
      : {
          title: "Hidden from future rolls",
          description: "We won't roll this one again.",
          action,
          duration: UNDO_TOAST_DURATION,
        },
  );
}
