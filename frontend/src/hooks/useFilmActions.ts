"use client";

import { useToast } from "@/components/ui/toast";
import { useAuthGate } from "./film-actions/use-auth-gate";
import { useFilmDecision } from "./film-actions/use-film-decision";
import { useFilmSentiment } from "./film-actions/use-film-sentiment";
import { useFilmStatusSync } from "./film-actions/use-film-status-sync";
import { useFilmWatchlist } from "./film-actions/use-film-watchlist";
import type { UseFilmActionsOptions } from "./film-actions/types";

export { AUTH_GATE_TITLE } from "./film-actions/auth-gate-title";
export type {
  AuthGate,
  FilmActionState,
  Sentiment,
} from "./film-actions/types";

export function useFilmActions(options: UseFilmActionsOptions) {
  const { toast } = useToast();
  const authGate = useAuthGate(options.filmId);
  const decision = useFilmDecision(options, authGate.triggerAuthGate, toast);
  const sentiment = useFilmSentiment(options, toast);
  const watchlist = useFilmWatchlist(options, authGate.triggerAuthGate, toast);

  useFilmStatusSync({
    filmId: options.filmId,
    filmTitle: options.filmTitle,
    isAuthenticated: options.isAuthenticated,
    setAction: decision.setAction,
    setSentiment: sentiment.setSentiment,
    setInWatchlist: watchlist.setInWatchlist,
    toast,
  });

  return {
    action: decision.action,
    pending: decision.pending,
    sentiment: sentiment.sentiment,
    sentimentDismissed: sentiment.sentimentDismissed,
    sentimentPending: sentiment.sentimentPending,
    dismissSentiment: sentiment.dismissSentiment,
    inWatchlist: watchlist.inWatchlist,
    watchlistPending: watchlist.watchlistPending,
    saveDecision: decision.saveDecision,
    saveSentiment: sentiment.saveSentiment,
    toggleWatchlist: watchlist.toggleWatchlist,
    authPrompt: authGate.authPrompt,
    closeAuthPrompt: authGate.closeAuthPrompt,
  };
}
