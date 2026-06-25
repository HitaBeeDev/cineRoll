export type PickRow = {
  id: string;
  slug: string;
  title: string;
  originalTitle: string | null;
  releaseYear: number;
  runtime: number | null;
  genres: string[];
  contentType: string;
  plot: string | null;
  director: string | null;
  posterUrl: string | null;
  posterColor: string | null;
  backdropUrl: string | null;
  imdbRating: number | null;
  rtScore: number | null;
  oscarNominations: number;
  oscarWins: number;
  ggNominations: number;
  ggWins: number;
  cannesNominations: number;
  cannesWins: number;
};

export type PoolRow = PickRow & {
  prestige: number;
  rollCount: number;
};

export type PickOfDayResult = {
  film: PickRow;
  fromHistory: boolean;
};
