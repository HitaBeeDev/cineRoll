import type { Film, PaginatedFilms } from "@cineroll/types";
import { API_URL } from "@/lib/api/constants/api-url";
import type { ToolDefinition, ToolParams } from "./tool-types";

// A day: example films and pool size only change on a seed.
const EXAMPLES_REVALIDATE_SECONDS = 86400;
const EXAMPLE_COUNT = 6;

async function fetchTopFilms(params: ToolParams, limit: number): Promise<PaginatedFilms | null> {
  const query = new URLSearchParams({ ...params, sort: "wins", limit: String(limit) });
  try {
    const response = await fetch(`${API_URL}/api/films?${query}`, {
      next: { revalidate: EXAMPLES_REVALIDATE_SECONDS },
    });
    if (!response.ok) return null;
    return (await response.json()) as PaginatedFilms;
  } catch {
    return null;
  }
}

/** The top film of each choice, skipping any already picked: one film often
 *  leads two genres (Titanic is both Drama and Romance). */
function pickOnePerChoice(pages: (PaginatedFilms | null)[]): Film[] {
  const picked = new Map<string, Film>();
  for (const page of pages) {
    const film = page?.films.find((candidate) => !picked.has(candidate.id));
    if (film) picked.set(film.id, film);
  }
  return [...picked.values()].slice(0, EXAMPLE_COUNT);
}

/**
 * Server-rendered examples for a tool page, plus the size of its pool. Tools
 * with choices show the most-awarded film of each choice (one per decade, one
 * per genre) so the examples show the range; the rest show the top six.
 */
export async function fetchToolExamples(
  tool: ToolDefinition,
): Promise<{ films: Film[]; total: number | null }> {
  const [base, perChoice] = await Promise.all([
    fetchTopFilms(tool.params, EXAMPLE_COUNT),
    tool.choices
      ? Promise.all(
          // Two spare choices, in case a choice's top films are all taken.
          tool.choices
            .slice(0, EXAMPLE_COUNT + 2)
            .map((choice) => fetchTopFilms({ ...tool.params, ...choice.params }, EXAMPLE_COUNT)),
        )
      : Promise.resolve(null),
  ]);

  const films = perChoice ? pickOnePerChoice(perChoice) : (base?.films ?? []);

  return { films, total: base?.total ?? null };
}
