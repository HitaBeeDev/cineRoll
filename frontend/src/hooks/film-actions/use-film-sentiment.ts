"use client";

import { useState } from "react";
import { markFilmWatched } from "@/lib/api";
import { showSaveError } from "@/hooks/film-actions/film-action-toasts/show-save-error";
import { showSentimentSaved } from "@/hooks/film-actions/film-action-toasts/show-sentiment-saved";
import { showSignInTasteNudge } from "@/hooks/film-actions/film-action-toasts/show-sign-in-taste-nudge";
import type {
  Sentiment,
  SentimentChoice,
  Toast,
  UseFilmActionsOptions,
} from "./types";

export function useFilmSentiment(
  options: UseFilmActionsOptions,
  toast: Toast,
) {
  const [sentiment, setSentiment] = useState<Sentiment>(null);
  const [sentimentDismissed, setSentimentDismissed] = useState(false);
  const [sentimentPending, setSentimentPending] = useState(false);

  /** Resolves true when the rating reached the server — the caller uses that to
   *  light "watched" alongside it, since the same request records both. */
  async function saveSentiment(value: SentimentChoice): Promise<boolean> {
    if (sentimentPending) return false;
    if (!options.isAuthenticated) {
      showSignInTasteNudge(toast);
      return false;
    }

    const previous = sentiment;
    const next = previous === value ? null : value;
    setSentiment(next);
    setSentimentPending(true);

    try {
      await markFilmWatched(options.filmId, false, next);
      if (!options.inlineConfirmation) {
        showSentimentSaved(toast, next, options.filmTitle);
      }
      return true;
    } catch {
      setSentiment(previous);
      showSaveError(toast);
      return false;
    } finally {
      setSentimentPending(false);
    }
  }

  function dismissSentiment(): void {
    setSentimentDismissed(true);
  }

  return {
    sentiment,
    sentimentDismissed,
    sentimentPending,
    setSentiment,
    saveSentiment,
    dismissSentiment,
  };
}
