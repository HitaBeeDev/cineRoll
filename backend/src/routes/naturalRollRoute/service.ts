import { loadCandidatesWithRelaxation, RelaxationResult } from "./candidateRelaxation";
import { prepareNaturalRollFilters } from "./filterPreparation";
import { selectFinalFilms } from "./finalFilms";
import { hasInterpretationSignal } from "./interpretationSignal";
import { referenceCandidateResult } from "./referenceFilm/referenceCandidateResult";
import { withReferencePreferences } from "./referenceFilm/referencePreferences";
import { resolveReference } from "./referenceFilm/resolveReference";
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
      // Plain-language account of what the request was read as — the anchor
      // film, or why a named one couldn't be used. Null when none was named.
      referenceNote: string | null;
      // True when nothing in the request gave the ranker anything to work with,
      // so the picks are the quality fallback rather than a match. Surfaced so
      // the UI can say so instead of presenting them as an answer.
      lowConfidence: boolean;
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
  // A named film ("similar to John Wick") is a nearest-neighbour question, not a
  // filter one — resolved first because a hit replaces the retrieval strategy
  // outright rather than narrowing it.
  const reference = await resolveReference(structuralFilters.referenceTitles);
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
      reference: reference.kind,
    }),
  );
  const candidateResult =
    (await referenceCandidateResult(
      reference,
      prepared.appliedFilters,
      prepared.droppedFilters,
      body.userId,
    ))
    ?? (await loadCandidatesWithRelaxation(
      prepared.effectiveFilters,
      body.userId,
      prepared.allowed,
      prepared.appliedFilters,
      prepared.droppedFilters,
    ));

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

  // Preferences read the pre-relaxation filters: even when a filter was
  // relaxed away to fill the pool, the ranking should still honor it. The
  // reference's own genres and tags ride along so the neighbourhood — or, for a
  // film we couldn't resolve, the attributes standing in for one — orders well.
  const preferences = withReferencePreferences(
    softPreferencesFrom(structuralFilters, prepared.appliedFilters, prepared.allowed),
    reference,
  );

  return {
    ok: true,
    candidateResult,
    preferences,
    resultCount: resolveResultCount(body.count),
    referenceNote: reference.kind === "none" ? null : reference.note,
    lowConfidence: !hasInterpretationSignal(prepared.appliedFilters, preferences, reference),
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
