import type { RecentRoll } from "./types";

export const calculateDimensionFactor = <T>(
  candidateValue: T,
  recentRolls: RecentRoll[],
  selectValue: (roll: RecentRoll) => T,
  decay: readonly number[],
  isPinned: boolean,
): number => {
  if (isPinned || candidateValue == null) return 1;

  const windowLength = Math.min(recentRolls.length, decay.length);
  for (let index = 0; index < windowLength; index++) {
    if (selectValue(recentRolls[index]!) === candidateValue) {
      return decay[index]!;
    }
  }

  return 1;
};
