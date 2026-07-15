"use client";

import { motion } from "framer-motion";
import {
  getBattleCardAnimation,
  getBattleCardHover,
  getBattleCardInitial,
} from "../battle-card-motion";
import type { FilmBattleCardProps } from "../component-props";
import { BattleCardCta } from "./battle-card-cta";
import { BattleCardInfo } from "./battle-card-info";
import { BattleCardPoster } from "./battle-card-poster";

export function FilmBattleCard({
  film,
  onPick,
  isPicked,
  isRejected,
  side,
  reducedMotion,
}: FilmBattleCardProps) {
  const hover = getBattleCardHover(isPicked, isRejected, reducedMotion);

  return (
    <motion.button
      onClick={onPick}
      disabled={isPicked || isRejected}
      initial={getBattleCardInitial(side, reducedMotion)}
      animate={getBattleCardAnimation({ side, isPicked, isRejected })}
      {...(hover ? { whileHover: hover } : {})}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="group relative flex h-full w-full cursor-pointer will-change-transform flex-col overflow-hidden rounded-2xl border border-[#1e1e2a] bg-[#0d0d1a] text-left shadow-[0_18px_60px_rgba(0,0,0,0.28)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8453c] disabled:cursor-default enabled:hover:border-[#e8453c]/70 enabled:hover:shadow-[0_0_38px_rgba(232,69,60,0.2)]"
      aria-label={`Pick ${film.title}`}
    >
      <BattleCardPoster film={film} isPicked={isPicked} />
      <BattleCardInfo film={film} />
      <BattleCardCta />
    </motion.button>
  );
}
