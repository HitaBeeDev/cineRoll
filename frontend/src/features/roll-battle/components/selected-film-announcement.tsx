"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { SelectedFilmAnnouncementProps } from "../component-props";

export function SelectedFilmAnnouncement({
  film,
  reducedMotion,
}: SelectedFilmAnnouncementProps) {
  return (
    <AnimatePresence mode="wait">
      {film && (
        <motion.p
          key={film.id}
          initial={reducedMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? {} : { opacity: 0, y: -6 }}
          className="font-[family-name:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.18em] text-[#e8453c]"
        >
          {film.title} advances.
        </motion.p>
      )}
    </AnimatePresence>
  );
}
