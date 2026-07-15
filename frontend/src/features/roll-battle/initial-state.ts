import type { RollBattleState } from "./domain-types";

export function createInitialRollBattleState(): RollBattleState {
  return {
    films: [],
    round: 0,
    champion: null,
    phase: "loading",
    pickedId: null,
    pickedFilms: [],
  };
}
