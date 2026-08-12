"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useFilmActions, AUTH_GATE_TITLE } from "@/hooks/useFilmActions";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { WatchlistButton } from "@/components/film-detail-actions/watchlist-button";
import { ActionGlyphs } from "@/components/film-detail-actions/action-glyphs";

/**
 * The action set on the film detail hero: one labelled control for saving, then
 * the circular glyph cluster for everything else.
 *
 * Behaviour is shared with the roll card through `useFilmActions`; only the
 * layout differs. `inlineConfirmation` is the one behavioural difference, and
 * it belongs to the layout: here the film stays on screen with its state lit,
 * so the confirmation toasts would only repeat it.
 */
export function FilmDetailActions({
  filmId,
  filmTitle,
  shareUrl,
  shareTitle,
  shareCaption,
}: {
  filmId: string;
  filmTitle: string;
  shareUrl: string;
  shareTitle: string;
  shareCaption: string;
}) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const pathname = usePathname();

  const {
    action,
    pending,
    sentiment,
    sentimentPending,
    inWatchlist,
    watchlistPending,
    saveDecision,
    saveSentiment,
    toggleWatchlist,
    authPrompt,
    closeAuthPrompt,
  } = useFilmActions({
    filmId,
    filmTitle,
    isAuthenticated,
    source: "film_detail",
    inlineConfirmation: true,
  });

  return (
    <>
      <WatchlistButton
        filmId={filmId}
        filmTitle={filmTitle}
        isAuthenticated={isAuthenticated}
        inWatchlist={inWatchlist}
        pending={watchlistPending}
        onToggle={() => void toggleWatchlist()}
      />

      <ActionGlyphs
        action={action}
        pending={pending}
        sentiment={sentiment}
        sentimentPending={sentimentPending}
        shareUrl={shareUrl}
        shareTitle={shareTitle}
        shareCaption={shareCaption}
        onMarkWatched={() => void saveDecision("watched", false)}
        onNotInterested={() => void saveDecision("not-interested", true)}
        onRate={(value) => void saveSentiment(value)}
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
    </>
  );
}
