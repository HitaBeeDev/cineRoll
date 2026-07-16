import { RandomFilmRow } from "../random";
import { SoftPreferences } from "./softPreferences";

// Shared rerank objective. Both rerank paths — this LLM prompt and the
// deterministic localReranker — must optimize the SAME thing on the SAME
// signals, or the same query returns different orderings depending on whether
// Gemini is available. The signals, strongest first: content type (absolute),
// requested genres, tones, themes, craft keywords, textual relevance, and only
// then IMDb rating as a weak tie-breaker. Keep this instruction and
// localReranker.ts in sync.
export const rerankInstruction = `
You are reranking film candidates for relevance to the user's request.

Rules, in order of priority:
1. Use only the exact IDs from the provided candidate list. Never invent titles.
2. Content type is absolute: if the extracted preferences say "movie", never pick a TV series, and vice versa.
3. requiredGenres are mandatory — a candidate missing one is ineligible unless every candidate misses it.
4. Explicit requirements (preferred genres, tones, themes, qualities in the extracted preferences) outweigh fame, popularity, and rating. Prefer candidates matching SEVERAL preferences simultaneously over famous titles matching one.
5. Among comparably relevant films, prefer higher IMDb ratings (shown as "IMDb x.x"; "NR" = unrated).
6. If the user asks for a hidden gem / underrated / obscure film, prefer titles NOT marked "(IMDb Top)".
7. If the user wants to avoid gore or violence, rank gory or slasher titles lower.

Return JSON: { "picks": ["id1", "id2", ...] }, best match first, exactly the requested number of picks.
`.trim();

export function rerankPrompt(
  prompt: string,
  preferences: SoftPreferences,
  candidates: RandomFilmRow[],
  count: number,
): string {
  return [
    `User request: "${prompt}"`,
    `Extracted preferences: ${JSON.stringify(preferencesForPrompt(preferences))}`,
    `Pick exactly the ${count} best from these ${candidates.length} candidates:`,
    formatCandidatesForRerank(candidates),
  ].join("\n\n");
}

// Only the fields the reranker should weigh; empty lists are noise.
function preferencesForPrompt(preferences: SoftPreferences): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(preferences).filter(
      ([, value]) => value !== null && (!Array.isArray(value) || value.length > 0),
    ),
  );
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
  // Enriched mood tags + TMDB keywords, when present — the strongest
  // soft-signal source. Keywords are capped: some films carry 30+.
  const tagList = [...(film.moodTags ?? []), ...(film.keywords ?? []).slice(0, 12)];
  const tags = tagList.length > 0 ? ` | tags: ${tagList.join(", ")}` : "";

  return `${film.id} | ${film.title} (${film.year}) | ${film.contentType} | ${genres}${director} | ${rating}${acclaim}${tags}${plot ? ` | ${plot}` : ""}`;
}
