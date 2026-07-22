"use client";

import { useState } from "react";
import { markFilmWatched } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { showDecisionSaved, showSaveError } from "./film-action-toasts";
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
) {
  const [action, setAction] = useState<FilmActionState>("none");
  const [pending, setPending] = useState(false);

  async function saveDecision(
    next: FilmDecision,
    doNotSuggest: boolean,
  ): Promise<void> {
    if (pending) return;
    if (!options.isAuthenticated) {
      triggerAuthGate(next === "watched" ? "watched" : "notInterested");
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
    completeDecision(options, next, toast);
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

function completeDecision(
  options: UseFilmActionsOptions,
  decision: FilmDecision,
  toast: Toast,
): void {
  const eventType = decision === "watched" ? "watched" : "not_interested";
  trackEvent({
    type: eventType,
    filmId: options.filmId,
    context: { source: options.source },
  });
  showDecisionSaved(toast, decision, options.filmTitle);
  if (decision === "watched") options.onWatched?.();
  else options.onNotInterested?.();
}
