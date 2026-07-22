import type { useToast } from "@/components/ui/toast";

export type FilmActionState = "none" | "watched" | "not-interested";
export type FilmDecision = Exclude<FilmActionState, "none">;
export type SentimentChoice = "like" | "dislike";
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
};
