"use client";

import { useToast } from "@/components/ui/toast/use-toast";
import { useAuthGate } from "./film-actions/use-auth-gate";
import { useFilmDecision } from "./film-actions/use-film-decision";
import { useFilmSentiment } from "./film-actions/use-film-sentiment";
import { useFilmStatusSync } from "./film-actions/use-film-status-sync";
import { useFilmWatchlist } from "./film-actions/use-film-watchlist";
import type {
  SentimentChoice,
  UseFilmActionsOptions,
} from "./film-actions/types";

export { AUTH_GATE_TITLE } from "./film-actions/auth-gate-title";
export type {
  AuthGate,
  FilmActionState,
  Sentiment,
} from "./film-actions/types";

export function useFilmActions(options: UseFilmActionsOptions) {
  const { toast } = useToast();
  const authGate = useAuthGate(options.filmId);
  // Sentiment first: undoing a decision has to clear the rating that went with it.
  const sentiment = useFilmSentiment(options, toast);
  const decision = useFilmDecision(options, authGate.triggerAuthGate, toast, () =>
    sentiment.setSentiment(null),
  );
  const watchlist = useFilmWatchlist(options, authGate.triggerAuthGate, toast);

  // A rating is an answer about a film you have seen, and the request that
  // records it marks the film watched server-side. The surfaces that show both
  // controls at once have to say so, or rating an unwatched film would leave a
  // lit verdict beside an unlit "Watched" and the page would be lying.
  async function saveSentiment(value: SentimentChoice): Promise<void> {
    if (await sentiment.saveSentiment(value)) decision.setAction("watched");
  }

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
    saveSentiment,
    toggleWatchlist: watchlist.toggleWatchlist,
    authPrompt: authGate.authPrompt,
    closeAuthPrompt: authGate.closeAuthPrompt,
  };
}
