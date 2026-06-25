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
// Which gated action a guest attempted — drives the inline sign-in prompt copy.
export type AuthGate = "watched" | "notInterested" | "watchlist";

// Guest sign-in nudges carry a CTA, so they linger longer than plain feedback
// toasts to give the user time to reach the button before auto-dismiss.
const NUDGE_TOAST_DURATION = 10000;

// Once a guest dismisses the inline sign-in prompt, we don't re-open it this
// session — further gated taps fall back to a quiet toast so the click still
// gives feedback without re-nagging with the full prompt.
const AUTH_PROMPT_SUPPRESS_KEY = "cineroll:auth-prompt-dismissed";

function isAuthPromptSuppressed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(AUTH_PROMPT_SUPPRESS_KEY) === "1";
  } catch {
    return false;
  }
}

const AUTH_GATE_TOAST: Record<AuthGate, { title: string; description: string }> = {
  watched: {
    title: "Sign in to rate this",
    description: "Marking films seen helps CineRoll learn your taste.",
  },
  notInterested: {
    title: "Sign in to skip films",
    description: "We'll keep films you pass out of future rolls.",
  },
  watchlist: {
    title: "Sign in to save",
    description: "Create a profile to keep a watchlist.",
  },
};

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
  // Inline sign-in prompt for guests who tap a gated action (watched/save).
  const [authPrompt, setAuthPrompt] = useState<AuthGate | null>(null);

  // Open the inline prompt, unless the guest already dismissed it this session —
  // then just give quiet toast feedback so the tap isn't a silent no-op.
  function triggerAuthGate(gate: AuthGate) {
    if (isAuthPromptSuppressed()) {
      toast({
        ...AUTH_GATE_TOAST[gate],
        action: { label: "Sign in", href: "/auth/signin" },
        duration: NUDGE_TOAST_DURATION,
      });
      return;
    }
    setAuthPrompt(gate);
  }

  function dismissAuthPrompt() {
    setAuthPrompt(null);
    try {
      window.sessionStorage.setItem(AUTH_PROMPT_SUPPRESS_KEY, "1");
    } catch {
      // Private mode / storage disabled: prompt simply won't be suppressed.
    }
  }

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
    dismissAuthPrompt,
  };
}
