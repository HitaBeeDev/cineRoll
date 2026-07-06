export type FilmOgRating = {
  label: string;
  value: string;
  dotColor: string;
};

export type FilmOgViewModel = {
  accent: string;
  backdropUrl: string | null;
  badges: string[];
  brandLabel: string;
  displayShareUrl: string;
  metaLine: string;
  plot: string | null;
  posterAlt: string;
  posterUrl: string | null;
  ratings: FilmOgRating[];
  title: string;
  titleSize: number;
};
