"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { FOCUS_RING } from "@/components/film-detail-actions/styles/focus-ring";
import { GLYPH_IDLE } from "@/components/film-detail-actions/styles/glyph-idle";
import { HERO_LABEL_TYPE } from "@/components/film-detail-actions/styles/hero-label-type";

// A pill, not a circle: round ends keep it in the glyph family — it is a glyph
// stretched to fit a word — while the word itself is what a touch user gets
// instead of the hover tooltip they will never see. 40px tall like the glyphs,
// so the 48px primary still owns the row.
const PILL = `flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 backdrop-blur-sm transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${HERO_LABEL_TYPE} ${FOCUS_RING}`;

// Watched fills solid in affirm green — this app's colour for a recorded
// personal fact, the same one the film card's quick actions light up in. Dark
// ink on affirm clears 7:1.
const WATCHED_ACTIVE = "border-affirm bg-affirm text-ink-950 hover:bg-affirm/90";

/**
 * "Watched" — the one fact in a row of opinions, and the only glyph-family
 * control that says out loud what it is.
 *
 * It was an unlabelled ✓ circle sitting immediately left of three unlabelled
 * verdict circles, which left nothing on screen to say that one of the four
 * records what happened and the other three record how you felt about it. The
 * word does that work on every device; the tooltip only did it on hover.
 */
export function WatchedPill({
  watched,
  pending,
  onToggle,
}: {
  watched: boolean;
  pending: boolean;
  onToggle: () => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      aria-pressed={watched}
      disabled={pending}
      onClick={onToggle}
      {...(reduceMotion ? {} : { whileTap: { scale: 0.96 } })}
      transition={{ duration: 0.12 }}
      className={cn(PILL, watched ? WATCHED_ACTIVE : GLYPH_IDLE)}
    >
      <Check className="h-4 w-4" aria-hidden />
      {/* The label never changes with the state. A control that renames itself
          under the cursor makes the reader re-read it to find out what it does
          now; the fill already says which way it is set. */}
      Watched
    </motion.button>
  );
}
