"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/** The room's own colour, used until a film brings its own. */
const RESTING_COLOR = "#12121e";

/**
 * The rolled film's dominant colour, bled into the room behind the page.
 *
 * `posterColor` is already stored for every film — it is what the poster's blur
 * placeholder is drawn from — so this costs no new data and no image decoding.
 * It is the cheapest thing on this page and the one that does the most work: the
 * panel stops being a dark box with a card in it and starts being lit by the
 * film that landed.
 *
 * Two layers cross-fade rather than one layer changing colour, because gradients
 * are not interpolable — animating between them snaps. The cross-fade and the
 * breath are separate elements for the same reason they are separate ideas: an
 * exit transition that inherited the breath's `repeat: Infinity` would never
 * finish, and the outgoing colour would never be removed.
 */
export function PosterColorBleed({ color }: { color: string | null | undefined }) {
  const reducedMotion = useReducedMotion();
  const safeColor = /^#[0-9a-f]{6}$/i.test(color ?? "") ? color! : RESTING_COLOR;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.div
          key={safeColor}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 1.1, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 70% 55% at 78% 22%, ${safeColor}59, transparent 68%),
                radial-gradient(ellipse 55% 45% at 12% 88%, ${safeColor}30, transparent 72%)`,
            }}
            animate={
              // The breath: slow enough to be felt rather than watched.
              reducedMotion ? {} : { opacity: [0.74, 1, 0.74], scale: [1, 1.06, 1] }
            }
            transition={
              reducedMotion
                ? { duration: 0 }
                : { duration: 14, repeat: Infinity, ease: "easeInOut" }
            }
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
