"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { BattleMatchupProps } from "../component-props";
import { FilmBattleCard } from "./film-battle-card";
import { VsDivider } from "./vs-divider";

export function BattleMatchup({
  leftFilm,
  rightFilm,
  pickedId,
  round,
  reducedMotion,
  onPick,
}: BattleMatchupProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={round}
        initial={reducedMotion ? false : { opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        {...(reducedMotion
          ? {}
          : { exit: { opacity: 0, y: -16, scale: 0.98 } })}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
        className="mt-1 grid grid-cols-1 items-stretch gap-3 sm:mt-2 sm:grid-cols-[1fr_36px_1fr]"
      >
        <FilmBattleCard
          film={leftFilm}
          onPick={() => onPick(leftFilm)}
          isPicked={pickedId === leftFilm.id}
          isRejected={pickedId !== null && pickedId !== leftFilm.id}
          side="left"
          reducedMotion={reducedMotion}
        />
        <VsDivider />
        <FilmBattleCard
          film={rightFilm}
          onPick={() => onPick(rightFilm)}
          isPicked={pickedId === rightFilm.id}
          isRejected={pickedId !== null && pickedId !== rightFilm.id}
          side="right"
          reducedMotion={reducedMotion}
        />
      </motion.div>
    </AnimatePresence>
  );
}
