import { RandomFilmRow } from "../random";

export const rerankInstruction = `
You are a film recommendation expert. Given a user's description and a list of candidate films, pick the best matches.
Return JSON: { "picks": ["id1", "id2", ...] }
Use the exact IDs from the list. Order best match first. Only return IDs from the provided list.
`.trim();

export function rerankPrompt(prompt: string, candidates: RandomFilmRow[], count: number): string {
  return `User wants: "${prompt}"\n\nPick the ${count} best from these ${candidates.length} films:\n\n${formatCandidatesForRerank(candidates)}`;
}

function formatCandidatesForRerank(candidates: RandomFilmRow[]): string {
  return candidates.map(formatCandidate).join("\n");
}

function formatCandidate(film: RandomFilmRow): string {
  const genres = Array.isArray(film.genres) ? film.genres.join(", ") : "";
  const plot = film.plot ? film.plot.slice(0, 160) : "";
  const director = film.director ? ` | Dir. ${film.director}` : "";

  return `${film.id} | ${film.title} (${film.year}) | ${genres}${director}${plot ? ` | ${plot}` : ""}`;
}
