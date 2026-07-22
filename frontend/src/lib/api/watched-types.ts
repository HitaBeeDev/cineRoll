export type FilmStatus = {
  watched: boolean;
  sentiment: "like" | "dislike" | null;
  doNotSuggest: boolean;
  inWatchlist: boolean;
};
