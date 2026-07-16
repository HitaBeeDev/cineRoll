"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";
import { FilmCard } from "@/components/home/film-card";
import { FilmCardEmpty, FilmCardSkeleton, ZeroResultsEmpty } from "@/components/home/empty-states";
import { cn } from "@/lib/utils";
import type { RollResultPanelProps } from "../component-props";
import { useRollResultScroll } from "../use-roll-result-scroll";
import {
  buildEmptyStateTransition,
  buildFadeInTransition,
  buildFadeOutTransition,
} from "../roll-result-motion";

export function RollResultPanel(props: RollResultPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useRollResultScroll(props.film, containerRef, props.reducedMotion);

  return (
    <div ref={containerRef} className={cn("relative z-0", "border-t border-[#1a1a28] lg:border-t-0 lg:border-l", "lg:col-span-5", "min-h-[360px] lg:min-h-0 lg:flex lg:flex-col lg:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:w-0", "p-4 sm:p-5 lg:p-4")}>
      <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">{props.rollAnnouncement}</p>
      <AnimatePresence mode="wait">
        {props.isRolling ? (
          <motion.div key="skeleton" layout={!props.reducedMotion} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: buildFadeOutTransition(props.reducedMotion) }} transition={buildFadeInTransition(props.reducedMotion)}>
            <FilmCardSkeleton />
          </motion.div>
        ) : props.film ? (
          <motion.div key={props.film.id} layout={!props.reducedMotion} initial={{ opacity: 0, y: props.reducedMotion ? 0 : 24, scale: props.reducedMotion ? 1 : 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, transition: buildFadeOutTransition(props.reducedMotion) }} transition={props.reducedMotion ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 19, mass: 0.9 }}>
            <FilmCard film={props.film} isAuthenticated={props.isAuthenticated} onNotInterested={props.onNotInterested} onNotTonight={props.onRoll} onWatched={props.onRoll} onSaved={props.onRoll} onEngage={props.onEngage} />
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
