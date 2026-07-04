"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Sparkles, Star, Trophy } from "lucide-react";

type CelebrationOverlayProps = {
  reduced: boolean;
};

const SPARKLES = [
  { Icon: Star, x: -92, y: -54, rotate: -18 },
  { Icon: Sparkles, x: 86, y: -62, rotate: 12 },
  { Icon: CheckCircle2, x: -76, y: 70, rotate: 8 },
  { Icon: Star, x: 90, y: 62, rotate: 22 },
];

export function CelebrationOverlay({ reduced }: CelebrationOverlayProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center">
      <motion.div
        initial={reduced ? false : { opacity: 0, scale: 0.55 }}
        animate={
          reduced ? { opacity: 0 } : { opacity: [0, 1, 1, 0], scale: [0.55, 1.12, 1, 1.18] }
        }
        transition={{ duration: 1.35, ease: "easeOut" }}
        className="relative flex h-28 w-28 items-center justify-center rounded-full border border-[#4ade80]/45 bg-[#07110b]/78 shadow-[0_0_70px_rgba(74,222,128,0.28)] backdrop-blur-md"
      >
        <Trophy className="h-12 w-12 text-[#4ade80]" />
        {SPARKLES.map(({ Icon, x, y, rotate }, index) => (
          <motion.span
            key={`${x}-${y}`}
            initial={reduced ? false : { opacity: 0, x: 0, y: 0, scale: 0.3, rotate: 0 }}
            animate={
              reduced
                ? { opacity: 0 }
                : { opacity: [0, 1, 1, 0], x, y, scale: [0.3, 1, 0.9, 0.75], rotate }
            }
            transition={{ duration: 1.15, delay: index * 0.06, ease: "easeOut" }}
            className="absolute flex h-10 w-10 items-center justify-center rounded-full border border-[#D4AF37]/35 bg-[#111118]/90 text-[#D4AF37]"
          >
            <Icon className="h-5 w-5" />
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
