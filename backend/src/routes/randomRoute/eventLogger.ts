import { RandomQuery } from "../../lib/filmFilters/randomQuerySchema";
import { logEvent } from "../../lib/events";
import { RandomFilmRow } from "./types";
import { RollLane } from "./rollScore";

type RollEventInput = {
  query: RandomQuery;
  film: RandomFilmRow;
  total: number;
  personalized: boolean;
  exploration: boolean;
  /** Absent on seeded rolls, which resolve deterministically and draw no lane. */
  lane: RollLane | undefined;
};

/**
 * Records the draw and returns its id.
 *
 * That id is the draw: the client carries it forward so the next roll can say
 * which draw it followed and how that one ended, which is the whole difference
 * between a log of films that appeared and a record of decisions we can grade.
 * The lane rides along for the same reason — an accept rate is only useful split
 * by the arm that produced it.
 */
export async function logRollEvent(input: RollEventInput): Promise<string | null> {
  const {
    userId,
    personalized: _personalized,
    excludeIds: _excludeIds,
    parentDraw,
    drawIndex,
    ...loggedFilters
  } = input.query;

  return logEvent({
    type: input.personalized ? "roll_personalized" : "roll",
    userId: userId ?? null,
    filmId: input.film.id,
    context: {
      source: "random_endpoint",
      personalized: input.personalized,
      ...(input.personalized ? { exploration: input.exploration } : {}),
      ...(input.lane ? { lane: input.lane } : {}),
      drawIndex: drawIndex ?? 0,
      ...(parentDraw
        ? { parentDrawId: parentDraw.drawId, parentOutcome: parentDraw.outcome }
        : {}),
      total: input.total,
      filters: loggedFilters,
    },
  });
}
