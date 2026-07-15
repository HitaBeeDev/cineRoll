import type { RollFilm } from "@/lib/api";
import { ROLL_BATTLE_TOTAL_ROUNDS } from "./constants";
import type { RollBattleState, RollBattleView } from "./domain-types";

export function getRollBattleView(state: RollBattleState): RollBattleView {
  const leftFilm = state.round === 0 ? state.films[0] ?? null : state.champion;
  const rightFilm = state.films[state.round + 1] ?? null;
  const selectedFilm = findSelectedFilm(state.pickedId, leftFilm, rightFilm);

  return {
    leftFilm,
    rightFilm,
    selectedFilm,
    championRailFilm: selectedFilm ?? (state.round > 0 ? leftFilm : null),
    completedRound: selectedFilm ? state.round + 1 : state.round,
    roundsLeft:
      ROLL_BATTLE_TOTAL_ROUNDS - state.round - (selectedFilm ? 1 : 0),
  };
}

function findSelectedFilm(
  pickedId: string | null,
  leftFilm: RollFilm | null,
  rightFilm: RollFilm | null,
): RollFilm | null {
  if (!pickedId) return null;
  if (leftFilm?.id === pickedId) return leftFilm;
  return rightFilm?.id === pickedId ? rightFilm : null;
}
