import type { RollBattleAction, RollBattleState } from "./domain-types";
import { createInitialRollBattleState } from "./initial-state";

export function rollBattleReducer(
  state: RollBattleState,
  action: RollBattleAction,
): RollBattleState {
  switch (action.type) {
    case "loading_started":
      return createInitialRollBattleState();
    case "pool_loaded":
      return { ...state, films: action.films, phase: "battling" };
    case "pool_failed":
      return { ...state, phase: "error" };
    case "film_picked":
      return {
        ...state,
        pickedId: action.film.id,
        pickedFilms: [...state.pickedFilms, action.film],
      };
    case "round_advanced":
      return {
        ...state,
        champion: action.champion,
        round: state.round + 1,
        pickedId: null,
      };
    case "battle_completed":
      return { ...state, champion: action.champion, phase: "result" };
  }
}
