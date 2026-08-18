"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import type { ReactNode } from "react";

/** Vertical drift in px, by column band. Zero for the first, so a third of the
 *  grid stays put and the rest reads as moving against it. */
const DRIFT_BY_BAND = [0, 26, 13];

/**
 * One tile in the results grid: its entrance, and its drift.
 *
 * The drift is what stops the grid reading as a spreadsheet — bands of tiles
 * travel at slightly different rates as the page scrolls, so the poster wall has
 * depth in it. It is driven by one scroll tracker on the grid, shared by every
 * tile, rather than a tracker each: forty subscriptions to the same scroll
 * position is forty times the work for one number.
 *
 * Drift and entrance are separate elements because both want to write `y`, and
 * an `animate` that lands on `y: 0` would overwrite the binding to the scroll
 * value and freeze the tile where it stopped.
 *
 * `useTransform` writes straight to the compositor, so a tile drifting past
 * never re-renders React.
 */
export function ParallaxTile({
  index,
  progress,
  animateEntrance,
  reducedMotion,
  children,
}: {
  index: number;
  /** 0 → 1 across the grid's travel through the viewport. */
  progress: MotionValue<number>;
  animateEntrance: boolean;
  reducedMotion: boolean;
  children: ReactNode;
}) {
  const drift = reducedMotion ? 0 : DRIFT_BY_BAND[index % DRIFT_BY_BAND.length]!;
  // Centred on the grid's midpoint, so tiles sit where the layout put them when
  // the grid is halfway through the viewport and lean either side of that.
  const y = useTransform(progress, [0, 1], [drift, -drift]);

  return (
    <motion.div style={{ y }}>
      <motion.div
        initial={{ opacity: 0, y: animateEntrance ? 8 : 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: animateEntrance ? Math.min(index * 0.025, 0.4) : 0,
          duration: animateEntrance ? 0.22 : 0.16,
          ease: "easeOut",
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
