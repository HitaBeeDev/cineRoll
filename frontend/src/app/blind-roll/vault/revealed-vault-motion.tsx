"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

type RevealedVaultMotionProps = {
  children: ReactNode;
  reduced: boolean;
};

export function RevealedVaultMotion({ children, reduced }: RevealedVaultMotionProps) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 18, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className="flex h-full min-h-0 flex-col gap-3"
    >
      {children}
    </motion.div>
  );
}
