"use client";

import { useState } from "react";
import { markFilmWatched } from "@/lib/api";
import {
  showSaveError,
  showSentimentSaved,
  showSignInTasteNudge,
} from "./film-action-toasts";
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

  async function saveSentiment(value: SentimentChoice): Promise<void> {
    if (sentimentPending) return;
    if (!options.isAuthenticated) {
      showSignInTasteNudge(toast);
      return;
    }

    const previous = sentiment;
    const next = previous === value ? null : value;
    setSentiment(next);
    setSentimentPending(true);

    try {
      await markFilmWatched(options.filmId, false, next);
      showSentimentSaved(toast, next, options.filmTitle);
    } catch {
      setSentiment(previous);
      showSaveError(toast);
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
