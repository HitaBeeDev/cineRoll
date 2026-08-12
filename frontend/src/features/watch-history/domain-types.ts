import type { FilmSentiment } from "@/lib/api/sentiment";

export type WatchedFilm = {
  id: string;
  slug: string;
  title: string;
  year: number | null;
  posterUrl: string | null;
  genres: string[];
  contentType: string | null;
  types: string[];
};

export type WatchedEntry = {
  id: string;
  sentiment: FilmSentiment | null;
  film: WatchedFilm;
};

export type WatchedSuccess = {
  status: "ok";
  entries: WatchedEntry[];
  nextCursor: string | null;
  total: number | null;
};

export type WatchedResult = WatchedSuccess | { status: "error" };

export type WatchedPage = {
  watched?: WatchedEntry[];
  nextCursor?: string | null;
  total?: number | null;
};
