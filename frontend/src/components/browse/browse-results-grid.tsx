"use client";

import { useScroll } from "framer-motion";
import { useRef } from "react";
import type { AwardBodyFilter, Film } from "@cineroll/types";
import { cn } from "@/lib/utils/cn";
import { FilmTile } from "@/components/film-tile";
import { FILM_GRID_CLASS } from "@/components/film-tile/film-grid-class";
import { ParallaxTile } from "@/components/browse/parallax-tile";
import type { AwardBadgeStatus } from "@/components/film-tile/award-badge";

/**
 * The poster wall itself, split out from the surrounding load/error/empty states
 * for one reason: `useScroll` needs its target attached to the DOM on the render
 * that calls it. Left in the parent it ran on every render — including the ones
 * showing skeletons, an error, or nothing at all, where the grid element does
 * not exist — and threw on an unhydrated ref. Here the hook and the element it
 * measures mount and unmount together.
 */
export function BrowseResultsGrid({
  films,
  awardBodies,
  awardStatus,
  animateEntrance,
  reducedMotion,
}: {
  films: Film[];
  awardBodies: AwardBodyFilter[];
  awardStatus: AwardBadgeStatus;
  animateEntrance: boolean;
  reducedMotion: boolean;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  // One tracker for the whole grid, read by every tile. `offset` measures the
  // grid's own travel through the viewport, which is what makes the drift
  // independent of how far down the page the grid happens to sit.
  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ["start end", "end start"],
  });

  return (
    // Hover is focus: the tile under the cursor keeps full strength and the rest
    // of the wall steps back, the way a light in a cinema picks one thing out.
    // Done in CSS rather than hover state in React — tracking it in state would
    // re-render forty tiles on every crossing between two of them.
    <div
      ref={gridRef}
      className={cn(
        FILM_GRID_CLASS,
        "[&>*]:transition-opacity [&>*]:duration-300",
        !reducedMotion && "[&:hover>*]:opacity-50 [&>*:hover]:opacity-100",
      )}
    >
      {films.map((film, index) => (
        <ParallaxTile
          key={film.id}
          index={index}
          progress={scrollYProgress}
          animateEntrance={animateEntrance}
          reducedMotion={reducedMotion}
        >
          <FilmTile film={film} awardBodies={awardBodies} awardStatus={awardStatus} />
        </ParallaxTile>
      ))}
    </div>
  );
}
