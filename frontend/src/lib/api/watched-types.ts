import type { FilmSentiment } from "@/lib/api/sentiment";

export type FilmStatus = {
  watched: boolean;
  sentiment: FilmSentiment | null;
  doNotSuggest: boolean;
  inWatchlist: boolean;
};
