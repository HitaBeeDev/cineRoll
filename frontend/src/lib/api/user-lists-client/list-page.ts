import type { SavedFilmEntry } from "@/types/saved-film";

export type ListPage = {
  films: SavedFilmEntry[];
  nextCursor: string | null;
};
