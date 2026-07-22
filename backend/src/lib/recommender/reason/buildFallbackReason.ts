import type { CandidateFilm } from "../types";

export const buildFallbackReason = (film: CandidateFilm): string => {
  const genre = film.genres[0];

  return genre ? `A highly rated ${genre} pick.` : "A highly rated award pick.";
};
