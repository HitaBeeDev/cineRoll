"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { FilmCard } from "@/components/home/film-card";
import { FilmCardEmpty, FilmCardSkeleton, ZeroResultsEmpty } from "@/components/home/empty-states";
import { usePointerTilt } from "@/hooks/use-pointer-tilt";
import { cn } from "@/lib/utils/cn";
import type { RollResultPanelProps } from "../component-props";
import { useRollResultScroll } from "../use-roll-result-scroll";
import { buildEmptyStateTransition } from "@/features/home/roll-result-motion/build-empty-state-transition";
import { buildFadeInTransition } from "@/features/home/roll-result-motion/build-fade-in-transition";
import { buildFadeOutTransition } from "@/features/home/roll-result-motion/build-fade-out-transition";
import { RollReel } from "@/features/home/roll-reel/components/roll-reel";

/** How a card leaves: thrown off the deck, or simply gone. */
type CardExit = "throw" | "fade";

/**
 * How the card leaves.
 *
 * A plain object rather than a variant label resolved through AnimatePresence's
 * `custom`: the card is always rendered at least once already carrying the exit
 * it will use, so there is nothing to resolve late. Pressing "not tonight" sets
 * the mode and asks for the next roll in one batch, and the roll does not clear
 * the film until the choreography's effect has run — a commit later, with this
 * already in place.
 */
function buildCardExit(exit: CardExit) {
  if (exit === "throw") {
    // Dealt off the deck. Skipping a film is a physical act — sliding it away
    // says "next" in a way that fading to nothing never did.
    return {
      opacity: 0,
      x: -260,
      rotate: -5,
      transition: { duration: 0.24, ease: [0.4, 0, 1, 1] as const },
    };
  }
  return { opacity: 0, transition: { duration: 0.15, ease: "easeIn" as const } };
}

export function RollResultPanel(props: RollResultPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardExit, setCardExit] = useState<CardExit>("fade");
  const reduced = Boolean(props.reducedMotion);
  const tilt = usePointerTilt({ disabled: reduced });
  useRollResultScroll(props.film, containerRef, props.reducedMotion);

  // Everything from the press to the stutter belongs to the reel; it is the
  // roll's loading state as well as its performance, which is why there is no
  // skeleton branch left here outside the reduced-motion path.
  const reelRunning =
    props.phase === "press" ||
    props.phase === "spin" ||
    props.phase === "lock" ||
    props.phase === "misfire";

  return (
    <div
      ref={containerRef}
      data-lenis-prevent
      // The sequence, readable from the DOM. Cheap, and the only way to assert
      // on the roll's choreography from an end-to-end test without reaching
      // into React.
      data-roll-phase={props.phase}
      className={cn("relative z-0", "border-t border-[#1a1a28] lg:border-t-0 lg:border-l", "lg:col-span-5", "min-h-[360px] lg:min-h-0 lg:flex lg:flex-col lg:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:w-0", "p-4 sm:p-5 lg:p-4")}
    >
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">{props.rollAnnouncement}</p>
      <AnimatePresence mode="wait">
        {reelRunning ? (
          <motion.div key="reel" className="flex flex-1 flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: buildFadeOutTransition(props.reducedMotion) }} transition={buildFadeInTransition(props.reducedMotion)}>
            <RollReel frames={props.reelFrames} phase={props.phase} pace={props.pace} showLeader={props.showLeader} />
          </motion.div>
        ) : reduced && props.isRolling ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: buildFadeOutTransition(props.reducedMotion) }} transition={buildFadeInTransition(props.reducedMotion)}>
            <FilmCardSkeleton />
          </motion.div>
        ) : props.film ? (
          <motion.div
            key={props.film.id}
            // The bloom: the card arrives at the size the locked frame left off
            // and grows into itself.
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={buildCardExit(reduced ? "fade" : cardExit)}
            transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 21, mass: 0.9 }}
            style={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY, transformPerspective: 1100 }}
            onPointerMove={tilt.onPointerMove}
            onPointerLeave={tilt.onPointerLeave}
          >
            {/* Only "not tonight" rolls on: rolling away is how that skip's
                weak penalty is applied. The three that record something keep
                the film on screen so the card can confirm it. */}
            <FilmCard
              film={props.film}
              isAuthenticated={props.isAuthenticated}
              cascade={!reduced}
              onNotInterested={props.onNotInterested}
              onNotTonight={() => {
                setCardExit("throw");
                props.onRoll();
              }}
              onEngage={props.onEngage}
            />
          </motion.div>
        ) : props.effectiveCount === 0 ? (
          <motion.div key="zero" layout={!props.reducedMotion} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: buildFadeOutTransition(props.reducedMotion) }} transition={buildEmptyStateTransition(props.reducedMotion)} className="flex flex-1 flex-col">
            <ZeroResultsEmpty onClear={props.onClearFilters} onClearAndRoll={props.onClearAndRoll} />
          </motion.div>
        ) : (
          <motion.div key="empty" layout={!props.reducedMotion} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: buildFadeOutTransition(props.reducedMotion) }} transition={buildEmptyStateTransition(props.reducedMotion)} className="flex flex-1 flex-col">
            <FilmCardEmpty />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
