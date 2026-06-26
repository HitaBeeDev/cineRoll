"use client";

import { useEffect, useState } from "react";
import {
  addFilmToWatchlist,
  removeFilmFromWatchlist,
  markFilmWatched,
  fetchFilmStatus,
} from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { useToast } from "@/components/ui/toast";
import {
  clearPendingFilmAction,
  setPendingFilmAction,
  takePendingFilmAction,
} from "@/lib/pending-intent";

export type FilmActionState = "none" | "watched" | "not-interested";
export type Sentiment = "like" | "dislike" | null;
// Which gated action a guest attempted — drives the auth modal copy and the
// action we replay once they come back signed in.
export type AuthGate = "watched" | "notInterested" | "watchlist";

// Modal title per gated action — shared by both surfaces that raise the gate.
export const AUTH_GATE_TITLE: Record<AuthGate, string> = {
  watched: "Sign in to mark films watched",
  notInterested: "Sign in to skip films",
  watchlist: "Sign in to save to your watchlist",
};

// Guest sign-in nudges carry a CTA, so they linger longer than plain feedback
// toasts to give the user time to reach the button before auto-dismiss.
const NUDGE_TOAST_DURATION = 10000;

/**
 * Shared post-roll / film-detail action set: Watched, Not Interested, the
 * 👍 / 👎 sentiment prompt, and the watchlist bookmark. Owns the optimistic
 * state, account mount-reflect, toasts, and analytics so both surfaces render
 * the same behaviour against their own layouts.
 *
 * `source` is attached to analytics events so we can tell where an action came
 * from (e.g. "roll_card" vs "film_detail").
 */
export function useFilmActions({
  filmId,
  filmTitle,
  isAuthenticated,
  source,
  onNotInterested,
}: {
  filmId: string;
  filmTitle: string;
  isAuthenticated: boolean;
  source: string;
  onNotInterested?: (() => void) | undefined;
}) {
  const { toast } = useToast();
  const [action, setAction] = useState<FilmActionState>("none");
  const [pending, setPending] = useState(false);
  // Sentiment prompt revealed once a film is marked watched (never blocking).
  const [sentiment, setSentiment] = useState<Sentiment>(null);
  const [sentimentDismissed, setSentimentDismissed] = useState(false);
  const [sentimentPending, setSentimentPending] = useState(false);
  // Watchlist bookmark: filled/active when the film is saved.
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistPending, setWatchlistPending] = useState(false);
  // Which gated action a guest just attempted — non-null opens the auth modal.
  const [authPrompt, setAuthPrompt] = useState<AuthGate | null>(null);

  // Guest tapped a gated action: stash it so it survives the sign-in round-trip,
  // then open the auth modal. On return we replay it automatically.
  function triggerAuthGate(gate: AuthGate) {
    setPendingFilmAction(filmId, gate);
    setAuthPrompt(gate);
  }

  // Modal dismissed without signing in: drop the stashed intent so it can't
  // replay unexpectedly the next time the user signs in elsewhere.
  function closeAuthPrompt() {
    setAuthPrompt(null);
    clearPendingFilmAction(filmId);
  }

  // Revisiting a film the user already acted on: reflect its existing
  // watchlist / watched / sentiment state so the UI matches the account, then
  // replay any action a guest queued before signing in.
  // Non-blocking; a failed read just leaves the default state.
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    void fetchFilmStatus(filmId)
      .then(async (status) => {
        if (cancelled) return;
        if (status.watched) {
          setAction(status.doNotSuggest ? "not-interested" : "watched");
          setSentiment(status.sentiment);
        }
        setInWatchlist(status.inWatchlist);

        const pendingAction = takePendingFilmAction(filmId);
        if (!pendingAction) return;
        try {
          if (pendingAction === "watchlist") {
            if (!status.inWatchlist) {
              await addFilmToWatchlist(filmId);
              if (cancelled) return;
              setInWatchlist(true);
              toast({ variant: "success", title: "Added to watchlist", description: filmTitle });
            }
          } else {
            const doNotSuggest = pendingAction === "notInterested";
            await markFilmWatched(filmId, doNotSuggest);
            if (cancelled) return;
            setAction(doNotSuggest ? "not-interested" : "watched");
            toast({
              variant: doNotSuggest ? "default" : "success",
              title: doNotSuggest ? "Hidden from future rolls" : "Marked as watched",
              description: filmTitle,
            });
          }
        } catch {
          // Non-blocking: the user can simply tap again.
        }
      })
      .catch(() => {
        // Non-blocking: leave the default state on failure.
      });

    return () => {
      cancelled = true;
    };
  }, [filmId, isAuthenticated, filmTitle, toast]);

  async function saveDecision(
    next: "watched" | "not-interested",
    doNotSuggest: boolean,
  ) {
    if (pending) return;
    // Both Watched and Not Interested need an account to persist, so guests get
    // the inline sign-in prompt instead of a session-only effect.
    if (!isAuthenticated) {
      triggerAuthGate(next === "watched" ? "watched" : "notInterested");
      return;
    }

    const previous = action;
    setAction(next);

    setPending(true);
    try {
      await markFilmWatched(filmId, doNotSuggest);
    } catch {
      setAction(previous);
      toast({
        variant: "error",
        title: "Couldn't save",
        description: "Check your connection and try again.",
      });
      return;
    } finally {
      setPending(false);
    }

    if (next === "watched") {
      void trackEvent({ type: "watched", filmId, context: { source } });
      toast({
        variant: "success",
        title: "Marked as watched",
        description: filmTitle,
      });
    } else {
      void trackEvent({ type: "not_interested", filmId, context: { source } });
      toast({
        title: "Hidden from future rolls",
        description: "We won't roll this one again.",
      });
      onNotInterested?.();
    }
  }

  async function saveSentiment(value: "like" | "dislike") {
    if (sentimentPending) return;

    // Guests can tap, but their taste isn't saved — nudge them to sign in.
    if (!isAuthenticated) {
      toast({
        title: "Sign in to save your taste",
        description: "Create a profile to tune your recommendations.",
        action: { label: "Sign in", href: "/auth/signin" },
        duration: NUDGE_TOAST_DURATION,
      });
      return;
    }

    const previous = sentiment;
    // Tapping the active choice again clears it (toggle off).
    const next: Sentiment = previous === value ? null : value;
    setSentiment(next);
    setSentimentPending(true);
    try {
      // Re-upserts the watched record with the sentiment; the API helper also
      // fires the `sentiment_set` analytics event.
      await markFilmWatched(filmId, false, next);
      toast({
        variant: next === null ? "default" : "success",
        title:
          next === "like"
            ? "Glad you liked it"
            : next === "dislike"
              ? "Noted — not for you"
              : "Rating cleared",
        description: filmTitle,
      });
    } catch {
      setSentiment(previous);
      toast({
        variant: "error",
        title: "Couldn't save",
        description: "Check your connection and try again.",
      });
    } finally {
      setSentimentPending(false);
    }
  }

  async function toggleWatchlist() {
    if (!isAuthenticated) {
      triggerAuthGate("watchlist");
      return;
    }
    if (watchlistPending) return;

    // Optimistic flip; revert on failure.
    const next = !inWatchlist;
    setInWatchlist(next);
    setWatchlistPending(true);
    try {
      if (next) {
        await addFilmToWatchlist(filmId);
        toast({
          variant: "success",
          title: "Added to watchlist",
          description: filmTitle,
        });
      } else {
        await removeFilmFromWatchlist(filmId);
        toast({ title: "Removed from watchlist", description: filmTitle });
      }
    } catch (error) {
      const code = error instanceof Error
        ? (error as Error & { code?: string }).code
        : undefined;
      // Adding something already saved is a success, not an error: keep it active.
      if (code === "WATCHLIST_ALREADY_EXISTS") {
        toast({ title: "Already saved", description: filmTitle });
      } else {
        setInWatchlist(!next);
        toast({
          variant: "error",
          title: "Couldn't save",
          description: filmTitle,
        });
      }
    } finally {
      setWatchlistPending(false);
    }
  }

  return {
    action,
    pending,
    sentiment,
    sentimentDismissed,
    sentimentPending,
    dismissSentiment: () => setSentimentDismissed(true),
    inWatchlist,
    watchlistPending,
    saveDecision,
    saveSentiment,
    toggleWatchlist,
    authPrompt,
    closeAuthPrompt,
  };
}
