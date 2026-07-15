"use client";

import { motion } from "framer-motion";
import type { CompletionProgressBarProps } from "../completionist-component-types";

export function CompletionProgressBar({
  percentage,
  reduceMotion,
  delay = 0,
  className,
}: CompletionProgressBarProps) {
  const width = `${Math.min(100, Math.max(0, percentage))}%`;

  return (
    <div
      className={`overflow-hidden rounded-full bg-[#171722] ${className}`}
      aria-hidden
    >
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-[#9e2924] to-[#e8453c]"
        initial={reduceMotion ? { width } : { width: 0 }}
        whileInView={{ width }}
        viewport={{ once: true, amount: 0.5 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }
        }
      />
    </div>
  );
}
