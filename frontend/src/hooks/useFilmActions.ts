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

export type FilmActionState = "none" | "watched" | "not-interested";
export type Sentiment = "like" | "dislike" | null;

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

  // Revisiting a film the user already acted on: reflect its existing
  // watchlist / watched / sentiment state so the UI matches the account.
  // Non-blocking; a failed read just leaves the default state.
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    void fetchFilmStatus(filmId)
      .then((status) => {
        if (cancelled) return;
        if (status.watched) {
          setAction(status.doNotSuggest ? "not-interested" : "watched");
          setSentiment(status.sentiment);
        }
        setInWatchlist(status.inWatchlist);
      })
      .catch(() => {
        // Non-blocking: leave the default state on failure.
      });

    return () => {
      cancelled = true;
    };
  }, [filmId, isAuthenticated]);

  async function saveDecision(
    next: "watched" | "not-interested",
    doNotSuggest: boolean,
  ) {
    if (pending) return;
    const previous = action;
    setAction(next);

    // Signed-in users persist to their account; guests get a session-only effect.
    if (isAuthenticated) {
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
        title: isAuthenticated ? "Hidden from future rolls" : "Skipped",
        description: isAuthenticated
          ? "We won't roll this one again."
          : "Sign in to hide it for next time.",
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
      toast({
        title: "Sign in to save",
        description: "Create a profile to keep a watchlist.",
      });
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
  };
}
