import { loadCandidatesWithRelaxation } from "./candidateRelaxation";
import { NATURAL_ROLL_LIMITS } from "./constants";
import { prepareNaturalRollFilters } from "./filterPreparation";
import { selectFinalFilms } from "./finalFilms";
import { NaturalRollBody } from "./schemas";
import { extractStructuralFilters } from "./structuralExtractor";

export async function naturalRoll(body: NaturalRollBody) {
  const count = body.count ?? NATURAL_ROLL_LIMITS.defaultCount;
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
      ok: false as const,
      error: {
        error: "No films match the interpreted filters",
        code: "NO_FILMS_FOUND",
      interpretedFilters: candidateResult.appliedFilters,
      droppedFilters: candidateResult.droppedFilters,
      },
    };
  }

  return {
    ok: true as const,
    payload: {
      films: await selectFinalFilms(body.prompt, candidateResult.films, count),
      total: candidateResult.total,
      interpretedFilters: candidateResult.appliedFilters,
      droppedFilters: candidateResult.droppedFilters,
      relaxed: candidateResult.relaxed,
    },
  };
}
