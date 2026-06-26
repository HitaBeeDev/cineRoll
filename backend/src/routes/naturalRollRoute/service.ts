import { loadCandidatesWithRelaxation, RelaxationResult } from "./candidateRelaxation";
import { prepareNaturalRollFilters } from "./filterPreparation";
import { selectFinalFilms } from "./finalFilms";
import { NaturalRollBody } from "./schemas";
import { extractStructuralFilters } from "./structuralExtractor";

// The natural roll runs as two phases so the route can stream progressively:
//
//   1. interpret — Stage-1 structural extraction + candidate selection (+ filter
//      relaxation). Produces the interpreted filters the UI shows immediately.
//   2. rank      — the Stage-2 rerank LLM call that orders the final picks.
//
// Splitting them lets the caller emit the interpreted filters the instant phase
// one finishes, while the (separate, network-bound) rerank still runs — instead
// of making the client wait on both serial LLM hops before seeing anything.

export type InterpretOutcome =
  | {
      ok: false;
      error: {
        error: string;
        code: "NO_FILMS_FOUND";
        interpretedFilters: Record<string, unknown>;
        droppedFilters: string[];
      };
    }
  | { ok: true; candidateResult: RelaxationResult };

export type RankPayload = {
  films: Awaited<ReturnType<typeof selectFinalFilms>>;
  total: number;
  interpretedFilters: Record<string, unknown>;
  droppedFilters: string[];
  relaxed: boolean;
};

/** Phase 1: extract structural filters and select candidates (with relaxation). */
export async function interpretNaturalRoll(body: NaturalRollBody): Promise<InterpretOutcome> {
  const structuralFilters = await extractStructuralFilters(body.prompt);
  const prepared = await prepareNaturalRollFilters(structuralFilters, body.userId);
  const candidateResult = await loadCandidatesWithRelaxation(
    structuralFilters,
    body.userId,
    prepared.allowed,
    prepared.appliedFilters,
    prepared.droppedFilters,
  );

  if (candidateResult.films.length === 0) {
    return {
      ok: false,
      error: {
        error: "No films match the interpreted filters",
        code: "NO_FILMS_FOUND",
        interpretedFilters: candidateResult.appliedFilters,
        droppedFilters: candidateResult.droppedFilters,
      },
    };
  }

  return { ok: true, candidateResult };
}

/** Phase 2: rerank the selected candidates into the final ordered picks. */
export async function rankNaturalRoll(
  prompt: string,
  candidateResult: RelaxationResult,
  count: number,
): Promise<RankPayload> {
  return {
    films: await selectFinalFilms(prompt, candidateResult.films, count),
    total: candidateResult.total,
    interpretedFilters: candidateResult.appliedFilters,
    droppedFilters: candidateResult.droppedFilters,
    relaxed: candidateResult.relaxed,
  };
}
