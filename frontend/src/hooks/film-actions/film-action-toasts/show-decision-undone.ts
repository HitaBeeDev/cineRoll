import type { FilmDecision, Toast } from "../types";

// Matches showDecisionSaved: an Undo the user has to read, decide on, and reach.
const UNDO_TOAST_DURATION = 6500;

/**
 * Confirms that a decision was taken back. Shared by every surface that can
 * un-watch a film — the decision buttons and the history page — so the wording
 * is the same wherever it happens.
 *
 * `onRestore` is optional because most surfaces reach this THROUGH an Undo
 * already; offering a second one there would just loop.
 */
export function showDecisionUndone(
  toast: Toast,
  decision: FilmDecision,
  filmTitle: string,
  onRestore?: () => void,
): void {
  const action = onRestore ? { label: "Undo", onClick: onRestore } : undefined;

  toast({
    title:
      decision === "watched"
        ? "Removed from your history"
        : "Back in your rolls",
    description: filmTitle,
    ...(action ? { action, duration: UNDO_TOAST_DURATION } : {}),
  });
}
