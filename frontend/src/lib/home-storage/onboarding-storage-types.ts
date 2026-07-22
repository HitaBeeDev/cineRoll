export type PendingWatchedFilm = {
  filmId: string;
  watchedAt: string;
  source: "onboarding";
  synced: false;
};

export type TasteSeed = {
  source: "onboarding";
  filmIds: string[];
  genres: string[];
  primaryGenre: string | null;
  createdAt: string;
};
