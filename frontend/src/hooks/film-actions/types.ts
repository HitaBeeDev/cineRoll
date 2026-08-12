import type { useToast } from "@/components/ui/toast/use-toast";
import type { FilmSentiment } from "@/lib/api/sentiment";

export type FilmActionState = "none" | "watched" | "not-interested";
export type FilmDecision = Exclude<FilmActionState, "none">;
/** Three levels, ordered weakest to strongest. There is no "it was fine": a
 *  watched film with a null sentiment already means that. */
export type SentimentChoice = FilmSentiment;
export type Sentiment = SentimentChoice | null;
export type AuthGate = "watched" | "notInterested" | "watchlist";
export type Toast = ReturnType<typeof useToast>["toast"];

export type UseFilmActionsOptions = {
  filmId: string;
  filmTitle: string;
  isAuthenticated: boolean;
  source: string;
  onNotInterested?: (() => void) | undefined;
  onWatched?: (() => void) | undefined;
  onSaved?: (() => void) | undefined;
  /** The decision was taken back. Surfaces that removed the film on
   *  onNotInterested / onWatched use this to put it back. */
  onDecisionUndone?: (() => void) | undefined;
  /** This surface shows the result of every action in place and keeps it on
   *  screen — a lit button, a filled glyph — so the confirmation toasts would
   *  only repeat what the user can already see. Errors still toast: a failure
   *  has no inline representation. Surfaces where the film LEAVES the screen
   *  once it's marked (the roll card) must leave this off — there the toast is
   *  the only thing carrying the Undo. */
  inlineConfirmation?: boolean | undefined;
};
