"use client";

import { useState } from "react";
import { markFilmWatched, removeFilmWatched } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { showDecisionSaved } from "@/hooks/film-actions/film-action-toasts/show-decision-saved";
import { showDecisionUndone } from "@/hooks/film-actions/film-action-toasts/show-decision-undone";
import { showSaveError } from "@/hooks/film-actions/film-action-toasts/show-save-error";
import { showUndoError } from "@/hooks/film-actions/film-action-toasts/show-undo-error";
import type {
  AuthGate,
  FilmActionState,
  FilmDecision,
  Toast,
  UseFilmActionsOptions,
} from "./types";

export function useFilmDecision(
  options: UseFilmActionsOptions,
  triggerAuthGate: (gate: AuthGate) => void,
  toast: Toast,
  clearSentiment: () => void,
) {
  const [action, setAction] = useState<FilmActionState>("none");
  const [pending, setPending] = useState(false);

  // Takes the decision back. Reached two ways: tapping the lit button, or the
  // Undo in the toast — the toast being the only route on surfaces (the roll
  // card, recommendations) where the film leaves the screen once it's marked.
  async function undoDecision(decision: FilmDecision): Promise<void> {
    setAction("none");
    // The server drops the whole watched row, rating included, so the local
    // sentiment has to go with it or a re-mark would show a stale thumb.
    clearSentiment();

    // The card comes back first, before the request. Undo is a request to see
    // the film again, and a dropped connection is no reason to swallow it. If
    // the delete then fails, the restored card re-reads its real status on
    // mount and lights its button again — so the screen still tells the truth.
    options.onDecisionUndone?.();

    if (await clearDecision(options.filmId)) {
      showDecisionUndone(toast, decision, options.filmTitle);
      return;
    }
    setAction(decision);
    showUndoError(toast, options.filmTitle);
  }

  async function saveDecision(
    next: FilmDecision,
    doNotSuggest: boolean,
  ): Promise<void> {
    if (pending) return;
    if (!options.isAuthenticated) {
      triggerAuthGate(next === "watched" ? "watched" : "notInterested");
      return;
    }

    // Tapping the decision that is already active takes it back. The buttons
    // read as toggles (they stay lit, and carry aria-pressed), so a mis-tap has
    // to be fixable where it happened.
    if (action === next) {
      setPending(true);
      await undoDecision(next);
      setPending(false);
      return;
    }

    const previous = action;
    setAction(next);
    setPending(true);
    const saved = await persistDecision(options.filmId, doNotSuggest);
    setPending(false);

    if (!saved) {
      setAction(previous);
      showSaveError(toast);
      return;
    }
    completeDecision(options, next, toast, () => void undoDecision(next));
  }

  return { action, pending, setAction, saveDecision };
}

async function persistDecision(
  filmId: string,
  doNotSuggest: boolean,
): Promise<boolean> {
  try {
    await markFilmWatched(filmId, doNotSuggest);
    return true;
  } catch {
    return false;
  }
}

async function clearDecision(filmId: string): Promise<boolean> {
  try {
    await removeFilmWatched(filmId);
    return true;
  } catch {
    return false;
  }
}

function completeDecision(
  options: UseFilmActionsOptions,
  decision: FilmDecision,
  toast: Toast,
  onUndo: () => void,
): void {
  const eventType = decision === "watched" ? "watched" : "not_interested";
  trackEvent({
    type: eventType,
    filmId: options.filmId,
    context: { source: options.source },
  });
  showDecisionSaved(toast, decision, options.filmTitle, onUndo);
  if (decision === "watched") options.onWatched?.();
  else options.onNotInterested?.();
}
