"use client";

import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import type { BattleCardWinnerOverlayProps } from "../component-props";

export function BattleCardWinnerOverlay({
  visible,
}: BattleCardWinnerOverlayProps) {
  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex items-center justify-center bg-[#e8453c]/18 shadow-[inset_0_0_60px_rgba(232,69,60,0.18)] ring-2 ring-inset ring-[#e8453c]/60"
    >
      <div className="rounded-full bg-[#e8453c] p-3 shadow-[0_0_20px_rgba(232,69,60,0.5)]">
        <Trophy className="h-5 w-5 text-[#F5F5F0]" aria-hidden />
      </div>
    </motion.div>
  );
}
