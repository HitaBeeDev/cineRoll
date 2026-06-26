import { RandomFilmRow } from "../random";

// Shared rerank objective. Both rerank paths — this LLM prompt and the
// deterministic localReranker — must optimize the SAME thing on the SAME
// signals, or the same query returns different orderings depending on whether
// Gemini is available. The signals are: textual relevance, IMDb rating as a
// quality prior, and the explicit "underrated" / "avoid gore" preferences.
// Keep this instruction and localReranker.ts in sync.
export const rerankInstruction = `
You are a film recommendation expert. Rank the candidate films by how well they satisfy the user's description.

Apply this objective, in order:
1. Relevance — match the description's mood, theme, genre, era, people, and any explicit constraints.
2. Quality prior — among comparably relevant films, prefer higher IMDb ratings (shown as "IMDb x.x"; "NR" = unrated).
3. Explicit preferences in the description:
   - If the user asks for a hidden gem / underrated / obscure film, prefer titles NOT marked "(IMDb Top)".
   - If the user wants to avoid gore or violence, rank gory or slasher titles lower.

Return JSON: { "picks": ["id1", "id2", ...] }, best match first.
Use only the exact IDs from the provided list.
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
  const rating = film.imdbRating != null ? `IMDb ${film.imdbRating.toFixed(1)}` : "IMDb NR";
  // Surfaces the same acclaim signal localReranker uses for "underrated" intent.
  const acclaim = film.imdbTopMovieRank || film.imdbTopTvRank ? " (IMDb Top)" : "";

  return `${film.id} | ${film.title} (${film.year}) | ${genres}${director} | ${rating}${acclaim}${plot ? ` | ${plot}` : ""}`;
}
