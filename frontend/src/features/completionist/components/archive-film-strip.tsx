"use client";

import { motion } from "framer-motion";
import type { ArchiveFilmStripProps } from "../completionist-component-types";

const FRAME_COUNT = 48;
const SCALE_LABELS = ["0", "25", "50", "75", "100%"];

const perforation = {
  height: "4px",
  backgroundImage:
    "radial-gradient(circle at 3px 2px, #2e2e3c 1.3px, transparent 1.3px)",
  backgroundSize: "14px 4px",
};

export function ArchiveFilmStrip({
  percentage,
  reduceMotion,
}: ArchiveFilmStripProps) {
  const clamped = Math.min(100, Math.max(0, percentage));
  // Any progress at all lights at least one frame — the first watch must show.
  const filled =
    clamped === 0 ? 0 : Math.max(1, Math.round((clamped / 100) * FRAME_COUNT));

  return (
    <div
      className="mt-6"
      role="img"
      aria-label={`${clamped}% of the archive watched`}
    >
      <div style={perforation} aria-hidden />
      <div className="my-1.5 flex gap-[3px]" aria-hidden>
        {Array.from({ length: FRAME_COUNT }, (_, index) =>
          index < filled ? (
            <motion.span
              key={index}
              className="h-4 flex-1 rounded-[2px] bg-gradient-to-b from-[#e8453c] to-[#9e2924] shadow-[0_0_8px_rgba(232,69,60,0.35)]"
              initial={
                reduceMotion
                  ? { opacity: 1, scaleY: 1 }
                  : { opacity: 0, scaleY: 0.4 }
              }
              whileInView={{ opacity: 1, scaleY: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : { duration: 0.3, delay: index * 0.02, ease: "easeOut" }
              }
            />
          ) : (
            <span
              key={index}
              className="h-4 flex-1 rounded-[2px] bg-[#15151f]"
            />
          ),
        )}
      </div>
      <div style={perforation} aria-hidden />
      <div
        className="mt-2 flex justify-between font-[family-name:var(--font-geist-mono)] text-[10px] tabular-nums text-[#77778b]"
        aria-hidden
      >
        {SCALE_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  );
}
