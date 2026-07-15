"use client";

import { motion } from "framer-motion";
import { RollBattleWinnerCard } from "@/features/roll-battle-result/components/roll-battle-winner-card";
import type { WinnerResultProps } from "../component-props";
import { WinnerActions } from "./winner-actions";
import { WinnerHeading } from "./winner-heading";

export function WinnerResult({
  champion,
  pickedFilms,
  reducedMotion,
  shareStatus,
  onShare,
  onRestart,
}: WinnerResultProps) {
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 26 }}
      className="flex w-full max-w-3xl flex-col gap-6"
    >
      <WinnerHeading champion={champion} pickedFilms={pickedFilms} />
      <RollBattleWinnerCard
        film={champion}
        emptyAwardsLabel="No major award records"
      />
      <WinnerActions
        champion={champion}
        shareStatus={shareStatus}
        onShare={() => onShare(champion)}
        onRestart={onRestart}
      />
    </motion.div>
  );
}
