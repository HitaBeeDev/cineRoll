import { loadCandidatesWithRelaxation, RelaxationResult } from "./candidateRelaxation";
import { prepareNaturalRollFilters } from "./filterPreparation";
import { selectFinalFilms } from "./finalFilms";
import { NaturalRollBody } from "./schemas";
import {
  resolveResultCount,
  SoftPreferences,
  softPreferencesFrom,
} from "./softPreferences";
import { extractStructuralFilters } from "./structuralExtractor";

// The natural roll runs as two phases so the route can stream progressively:
//
//   1. interpret — Stage-1 extraction (hard filters + soft preferences +
//      result count) and candidate selection (+ filter relaxation). Produces
//      the interpreted filters the UI shows immediately.
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
  | {
      ok: true;
      candidateResult: RelaxationResult;
      preferences: SoftPreferences;
      // How many picks to return: the count stated in the prompt ("suggest
      // only one movie") wins over the client's requested count.
      resultCount: number;
    };

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
  const prepared = await prepareNaturalRollFilters(structuralFilters);
  // One line per roll so extraction failures are diagnosable from the server
  // log — when this pipeline misbehaves, the first question is always "what
  // did Stage 1 actually extract?".
  console.info(
    "Natural roll interpreted:",
    JSON.stringify({
      extracted: structuralFilters,
      applied: prepared.appliedFilters,
      dropped: prepared.droppedFilters,
    }),
  );
  const candidateResult = await loadCandidatesWithRelaxation(
    prepared.effectiveFilters,
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

  return {
    ok: true,
    candidateResult,
    // Preferences read the pre-relaxation filters: even when a filter was
    // relaxed away to fill the pool, the ranking should still honor it.
    preferences: softPreferencesFrom(structuralFilters, prepared.appliedFilters, prepared.allowed),
    resultCount: resolveResultCount(body.count),
  };
}

/** Phase 2: rerank the selected candidates into the final ordered picks. */
export async function rankNaturalRoll(
  prompt: string,
  preferences: SoftPreferences,
  candidateResult: RelaxationResult,
  count: number,
): Promise<RankPayload> {
  return {
    films: await selectFinalFilms(prompt, preferences, candidateResult.films, count),
    total: candidateResult.total,
    interpretedFilters: candidateResult.appliedFilters,
    droppedFilters: candidateResult.droppedFilters,
    relaxed: candidateResult.relaxed,
  };
}
