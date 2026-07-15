export type AwardRow = {
  filmSlug: string;
  filmTitle: string;
  releaseYear: number;
  posterUrl: string | null;
  category: string;
  awardYear: number;
  won: boolean;
};

export type FilmRow = {
  id: string;
  slug: string;
  title: string;
  releaseYear: number;
  posterUrl: string | null;
  imdbRating: number | null;
  role: "director" | "nominee";
};

export type PersonData = {
  name: string;
  slug: string;
  photoUrl: string | null;
  bio: string | null;
  totalNominations: number;
  totalWins: number;
  oscarRecords: AwardRow[];
  ggRecords: AwardRow[];
  cannesRecords: AwardRow[];
  films: FilmRow[];
};

export type AwardBody = {
  label: string;
  code: string;
  records: AwardRow[];
  wins: number;
};
