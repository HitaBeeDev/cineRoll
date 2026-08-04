import { GENRE_DISPLAY_NAMES } from "./genre-display-names";

export function formatGenre(genre: string): string {
  return GENRE_DISPLAY_NAMES[genre] ?? genre;
}
