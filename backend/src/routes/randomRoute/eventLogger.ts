import { RandomQuery } from "../../lib/filmFilters/randomQuerySchema";
import { logEvent } from "../../lib/events";
import { RandomFilmRow } from "./types";

export async function logRollEvent(
  query: RandomQuery,
  film: RandomFilmRow,
  total: number,
  usePersonalized: boolean,
  exploration: boolean,
): Promise<void> {
  const { userId, personalized: _personalized, excludeIds: _excludeIds, ...loggedFilters } = query;

  await logEvent({
    type: usePersonalized ? "roll_personalized" : "roll",
    userId: userId ?? null,
    filmId: film.id,
    context: {
      source: "random_endpoint",
      personalized: usePersonalized,
      ...(usePersonalized ? { exploration } : {}),
      total,
      filters: loggedFilters,
    },
  });
}
