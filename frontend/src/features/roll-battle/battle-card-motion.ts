import type { BattleCardSide } from "./domain-types";

type BattleCardMotionInput = {
  side: BattleCardSide;
  isPicked: boolean;
  isRejected: boolean;
};

export function getBattleCardInitial(
  side: BattleCardSide,
  reducedMotion: boolean,
) {
  return reducedMotion ? false : { opacity: 0, x: side === "left" ? -20 : 20 };
}

export function getBattleCardAnimation({
  side,
  isPicked,
  isRejected,
}: BattleCardMotionInput) {
  const direction = side === "left" ? -1 : 1;
  return {
    opacity: isRejected ? 0 : 1,
    x: isRejected ? direction * 360 : isPicked ? direction * -34 : 0,
    y: isPicked ? -12 : 0,
    rotate: isRejected ? direction * 8 : isPicked ? direction * -2 : 0,
    scale: isPicked ? 1.04 : isRejected ? 0.94 : 1,
  };
}

export function getBattleCardHover(
  isPicked: boolean,
  isRejected: boolean,
  reducedMotion: boolean,
) {
  return !isPicked && !isRejected && !reducedMotion
    ? { y: -4, scale: 1.015 }
    : undefined;
}
