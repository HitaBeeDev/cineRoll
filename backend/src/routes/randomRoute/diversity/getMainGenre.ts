export const getMainGenre = (genres: string[]): string | null =>
  genres[0] ?? null;
