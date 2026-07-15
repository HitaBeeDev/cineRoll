import type { RollFilm } from "@/lib/api";
import { getPrimaryGenre } from "./film-signals";

export function getNextBoutLabel(round: number, films: RollFilm[]): string {
  const nextFilm = films[round + 2];
  if (!nextFilm) return "Final decision";
  return `Next: ${getPrimaryGenre(nextFilm).toLowerCase()} challenger`;
}
