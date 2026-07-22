import type { AuthGate } from "./types";

export const AUTH_GATE_TITLE: Record<AuthGate, string> = {
  watched: "Sign in to mark films watched",
  notInterested: "Sign in to skip films",
  watchlist: "Sign in to save to your watchlist",
};
