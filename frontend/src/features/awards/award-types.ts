export type AwardFilm = { slug: string; title: string; year: number | null; posterUrl: string | null };
export type AwardEntry = { film: AwardFilm; won: boolean; nominee: string | null };

type BodyFields = { body: string; name: string; shortName: string };

export type AwardBodyPayload = BodyFields & {
  years: { year: number; films: number; wins: number }[];
  categories: { slug: string; name: string; films: number; firstYear: number; lastYear: number }[];
  genres: { slug: string; name: string; films: number }[];
};

export type AwardYearPayload = BodyFields & {
  year: number;
  films: number;
  prev: number | null;
  next: number | null;
  categories: { slug: string; name: string; entries: AwardEntry[] }[];
};

export type AwardCategoryPayload = BodyFields & {
  slug: string;
  name: string;
  films: number;
  years: { year: number; hasPage: boolean; entries: AwardEntry[] }[];
};

export type AwardCategoryYearPayload = BodyFields & {
  slug: string;
  name: string;
  year: number;
  prev: number | null;
  next: number | null;
  entries: AwardEntry[];
};

export type AwardGenrePayload = BodyFields & {
  slug: string;
  name: string;
  films: { film: AwardFilm; wins: number; nominations: number }[];
};
