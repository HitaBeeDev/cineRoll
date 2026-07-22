import type { FilmDecision, Sentiment, Toast } from "./types";

const NUDGE_TOAST_DURATION = 10_000;

export function showSaveError(toast: Toast, filmTitle?: string): void {
  toast({
    variant: "error",
    title: "Couldn't save",
    description: filmTitle ?? "Check your connection and try again.",
  });
}

export function showDecisionSaved(
  toast: Toast,
  decision: FilmDecision,
  filmTitle: string,
): void {
  toast(
    decision === "watched"
      ? { variant: "success", title: "Marked as watched", description: filmTitle }
      : {
          title: "Hidden from future rolls",
          description: "We won't roll this one again.",
        },
  );
}

export function showReplayedDecision(
  toast: Toast,
  decision: FilmDecision,
  filmTitle: string,
): void {
  toast({
    variant: decision === "watched" ? "success" : "default",
    title:
      decision === "watched" ? "Marked as watched" : "Hidden from future rolls",
    description: filmTitle,
  });
}

export function showSentimentSaved(
  toast: Toast,
  sentiment: Sentiment,
  filmTitle: string,
): void {
  const titles: Record<Exclude<Sentiment, null>, string> = {
    like: "Glad you liked it",
    dislike: "Noted — not for you",
  };
  toast({
    variant: sentiment === null ? "default" : "success",
    title: sentiment === null ? "Rating cleared" : titles[sentiment],
    description: filmTitle,
  });
}

export function showSignInTasteNudge(toast: Toast): void {
  toast({
    title: "Sign in to save your taste",
    description: "Create a profile to tune your recommendations.",
    action: { label: "Sign in", href: "/auth/signin" },
    duration: NUDGE_TOAST_DURATION,
  });
}

export function showWatchlistAdded(toast: Toast, filmTitle: string): void {
  toast({ variant: "success", title: "Added to watchlist", description: filmTitle });
}

export function showWatchlistRemoved(toast: Toast, filmTitle: string): void {
  toast({ title: "Removed from watchlist", description: filmTitle });
}

export function showAlreadySaved(toast: Toast, filmTitle: string): void {
  toast({ title: "Already saved", description: filmTitle });
}
