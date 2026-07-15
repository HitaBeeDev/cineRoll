export type Recommendation = {
  id: string;
  slug: string;
  title: string;
  year: number;
  posterUrl: string | null;
  genres: string[];
  director: string | null;
  imdbRating: number | null;
  rtScore: number | null;
  score: number;
  reason: string;
};
