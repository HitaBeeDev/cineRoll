"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useFilmActions, AUTH_GATE_TITLE } from "@/hooks/useFilmActions";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { SaveToListButton } from "@/components/save-to-list-dialog";
import { cn } from "@/lib/utils";
import { SECONDARY_BUTTON, SECONDARY_IDLE } from "@/components/film-detail-actions/styles";
import { WatchlistButton } from "@/components/film-detail-actions/watchlist-button";
import { DecisionIconButtons } from "@/components/film-detail-actions/decision-icon-buttons";
import { SentimentPrompt } from "@/components/film-detail-actions/sentiment-prompt";

/**
 * The post-roll action set, rendered on the film detail hero. Shares all
 * behaviour with the roll card via `useFilmActions`; only the layout differs.
 * Returns a fragment so the buttons sit in the hero's flex-wrap row and the
 * sentiment prompt wraps onto its own line.
 */
export function FilmDetailActions({
  filmId,
  filmTitle,
}: {
  filmId: string;
  filmTitle: string;
}) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const pathname = usePathname();

  const {
    action,
    pending,
    sentiment,
    sentimentDismissed,
    sentimentPending,
    dismissSentiment,
    inWatchlist,
    watchlistPending,
    saveDecision,
    saveSentiment,
    toggleWatchlist,
    authPrompt,
    closeAuthPrompt,
  } = useFilmActions({ filmId, filmTitle, isAuthenticated, source: "film_detail" });

  return (
    <>
      <WatchlistButton
        inWatchlist={inWatchlist}
        pending={watchlistPending}
        onToggle={() => void toggleWatchlist()}
      />

      {/* Save to a custom list — same secondary weight as the watchlist button. */}
      <SaveToListButton
        filmId={filmId}
        filmTitle={filmTitle}
        isAuthenticated={isAuthenticated}
        className={cn(SECONDARY_BUTTON, SECONDARY_IDLE)}
      />

      {/* Divider between the labelled primary CTAs and the quiet utility icons. */}
      <span
        aria-hidden
        className="mx-1.5 hidden h-8 w-px self-center bg-white/20 sm:block"
      />

      <DecisionIconButtons
        action={action}
        pending={pending}
        onMarkWatched={() => void saveDecision("watched", false)}
        onNotInterested={() => void saveDecision("not-interested", true)}
      />

      {/* Guest auth gate: a guest tapping Watched / Watchlist raises the sign-in
          modal. Their action is stashed and replayed when they return. */}
      <AuthDialog
        open={authPrompt !== null}
        onOpenChange={(open) => {
          if (!open) closeAuthPrompt();
        }}
        callbackUrl={pathname}
        title={authPrompt ? AUTH_GATE_TITLE[authPrompt] : undefined}
      />

      <SentimentPrompt
        visible={action === "watched" && !sentimentDismissed}
        sentiment={sentiment}
        pending={sentimentPending}
        onLike={() => void saveSentiment("like")}
        onDislike={() => void saveSentiment("dislike")}
        onDismiss={dismissSentiment}
      />
    </>
  );
}
